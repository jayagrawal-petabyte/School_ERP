const AppError = require('../errors/AppError');

const getSupabaseClient = () => {
  if (globalThis.__examsRelationshipSupabaseClient) {
    return globalThis.__examsRelationshipSupabaseClient;
  }

  if (globalThis.supabase) {
    return globalThis.supabase;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    globalThis.__examsRelationshipSupabaseClient = client;
    return client;
  } catch (error) {
    return null;
  }
};

const runQuery = async (queryBuilder) => {
  if (!queryBuilder) {
    return { data: [], error: null };
  }

  if (typeof queryBuilder.then === 'function') {
    return queryBuilder.then((result) => result);
  }

  if (Object.prototype.hasOwnProperty.call(queryBuilder, 'data') || Object.prototype.hasOwnProperty.call(queryBuilder, 'error')) {
    return queryBuilder;
  }

  if (typeof queryBuilder.maybeSingle === 'function') {
    return queryBuilder.maybeSingle();
  }

  return queryBuilder;
};

const normalizeIds = (ids = []) => [...new Set(
  (Array.isArray(ids) ? ids : [ids])
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value))
)];

const getCacheTtlMs = () => Number(process.env.EXAMS_METADATA_CACHE_TTL_MS || 300000);

const cache = {
  exams: new Map(),
  subjects: new Map(),
};

const getCachedValue = (cacheStore, id) => {
  const entry = cacheStore.get(id);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(id);
    return null;
  }

  return entry.value;
};

const setCachedValue = (cacheStore, id, value) => {
  cacheStore.set(id, {
    value,
    expiresAt: Date.now() + getCacheTtlMs(),
  });
};

const fetchRowsByIds = async (table, ids, selectColumns) => {
  console.log('[RelationshipService] fetchRowsByIds - Table:', table, 'IDs:', ids, 'Columns:', selectColumns);
  const client = getSupabaseClient();
  if (!client) {
    console.warn('[RelationshipService] fetchRowsByIds - Supabase client not available');
    return null;
  }

  const normalizedIds = normalizeIds(ids);
  if (normalizedIds.length === 0) {
    console.log('[RelationshipService] fetchRowsByIds - No normalized IDs');
    return [];
  }

  const response = await runQuery(
    client.from(table)
      .select(selectColumns)
      .in('id', normalizedIds)
  );

  if (response?.error) {
    const message = String(response.error?.message || '').toLowerCase();
    if (message.includes('does not exist') || message.includes('relation') || message.includes('not found')) {
      console.warn('[RelationshipService] fetchRowsByIds - Table does not exist or relation not found');
      return [];
    }

    console.error('[RelationshipService] fetchRowsByIds - Error fetching from', table, ':', response.error);
    throw new AppError(`Unable to fetch ${table} metadata`, 500, response.error);
  }

  console.log('[RelationshipService] fetchRowsByIds - Fetched', (response?.data || []).length, 'rows from', table);
  return response?.data || [];
};

const fetchExamsByIds = async (ids) => {
  console.log('[RelationshipService] fetchExamsByIds - IDs:', ids);
  const normalizedIds = normalizeIds(ids);
  const cachedResults = normalizedIds
    .map((id) => getCachedValue(cache.exams, id))
    .filter((value) => value !== null);
  console.log('[RelationshipService] fetchExamsByIds - Cached results:', cachedResults.length);
  
  const missingIds = normalizedIds.filter((id) => getCachedValue(cache.exams, id) === null);
  console.log('[RelationshipService] fetchExamsByIds - Missing IDs:', missingIds);

  const fetchedResults = missingIds.length > 0 ? await fetchRowsByIds('exams', missingIds, 'id,name,term,academic_year,class_id') : [];
  if (fetchedResults === null) {
    console.warn('[RelationshipService] fetchExamsByIds - fetchRowsByIds returned null');
    return null;
  }

  for (const exam of fetchedResults) {
    setCachedValue(cache.exams, String(exam.id), exam);
  }

  const result = [...cachedResults, ...fetchedResults];
  console.log('[RelationshipService] fetchExamsByIds - Total results:', result.length);
  return result;
};

const fetchSubjectsByIds = async (ids) => {
  console.log('[RelationshipService] fetchSubjectsByIds - IDs:', ids);
  const normalizedIds = normalizeIds(ids);
  const cachedResults = normalizedIds
    .map((id) => getCachedValue(cache.subjects, id))
    .filter((value) => value !== null);
  console.log('[RelationshipService] fetchSubjectsByIds - Cached results:', cachedResults.length);
  
  const missingIds = normalizedIds.filter((id) => getCachedValue(cache.subjects, id) === null);
  console.log('[RelationshipService] fetchSubjectsByIds - Missing IDs:', missingIds);

  const fetchedResults = missingIds.length > 0 ? await fetchRowsByIds('subjects', missingIds, 'id,name,class_id,sub_code') : [];
  if (fetchedResults === null) {
    console.warn('[RelationshipService] fetchSubjectsByIds - fetchRowsByIds returned null');
    return null;
  }

  for (const subject of fetchedResults) {
    setCachedValue(cache.subjects, String(subject.id), subject);
  }

  const result = [...cachedResults, ...fetchedResults];
  console.log('[RelationshipService] fetchSubjectsByIds - Total results:', result.length);
  return result;
};

const isParentOfStudent = async (parentId, studentId) => {
  console.log('[RelationshipService] isParentOfStudent - ParentID:', parentId, 'StudentID:', studentId);
  if (!parentId || !studentId) {
    console.error('[RelationshipService] isParentOfStudent - Invalid identifiers');
    throw new AppError('Invalid parent/student identifiers', 400);
  }

  const client = getSupabaseClient();
  if (!client) {
    console.warn('[RelationshipService] isParentOfStudent - Supabase client not available');
    return false;
  }

  const response = await runQuery(
    client.from('parent_students')
      .select('id')
      .eq('parent_id', parentId)
      .eq('student_id', studentId)
      .maybeSingle()
  );

  if (response?.error) {
    console.error('[RelationshipService] isParentOfStudent - Error:', response.error);
    throw new AppError('Unable to resolve parent-student relationship', 500, response.error);
  }

  const isParent = Boolean(response?.data);
  console.log('[RelationshipService] isParentOfStudent - Result:', isParent);
  return isParent;
};

const getParentStudentIds = async (parentId) => {
  console.log('[RelationshipService] getParentStudentIds - ParentID:', parentId);
  if (!parentId) {
    console.error('[RelationshipService] getParentStudentIds - Invalid parent identifier');
    throw new AppError('Invalid parent identifier', 400);
  }

  const client = getSupabaseClient();
  if (!client) {
    console.warn('[RelationshipService] getParentStudentIds - Supabase client not available');
    return [];
  }

  const response = await runQuery(
    client.from('parent_students')
      .select('student_id')
      .eq('parent_id', parentId)
  );

  if (response?.error) {
    console.error('[RelationshipService] getParentStudentIds - Error:', response.error);
    throw new AppError('Unable to fetch parent-student relationships', 500, response.error);
  }

  const result = (response?.data || [])
    .map((row) => row?.student_id)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value));
  
  console.log('[RelationshipService] getParentStudentIds - Found students:', result);
  return result;
};

const getTeacherClassIds = async (teacherId) => {
  console.log('[RelationshipService] getTeacherClassIds - TeacherID:', teacherId);
  if (!teacherId) {
    console.error('[RelationshipService] getTeacherClassIds - Invalid teacher identifier');
    throw new AppError('Invalid teacher identifier', 400);
  }

  const client = getSupabaseClient();
  if (!client) {
    console.warn('[RelationshipService] getTeacherClassIds - Supabase client not available');
    return [];
  }

  const response = await runQuery(
    client.from('class_teachers')
      .select('class_id')
      .eq('teacher_id', teacherId)
  );

  if (response?.error) {
    const message = String(response.error?.message || '').toLowerCase();
    if (message.includes('does not exist') || message.includes('relation') || message.includes('not found')) {
      console.warn('[RelationshipService] getTeacherClassIds - Table does not exist');
      return [];
    }

    console.error('[RelationshipService] getTeacherClassIds - Error:', response.error);
    throw new AppError('Unable to fetch teacher-class relationships', 500, response.error);
  }

  const result = (response?.data || [])
    .map((row) => row?.class_id)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value));
  
  console.log('[RelationshipService] getTeacherClassIds - Found classes:', result);
  return result;
};

const isTeacherAssignedToClass = async (teacherId, classId) => {
  if (!teacherId || !classId) {
    return false;
  }

  const teacherClassIds = await getTeacherClassIds(teacherId);
  return teacherClassIds.includes(String(classId));
};

module.exports = {
  isParentOfStudent,
  getParentStudentIds,
  getTeacherClassIds,
  isTeacherAssignedToClass,
  fetchExamsByIds,
  fetchSubjectsByIds,
};
