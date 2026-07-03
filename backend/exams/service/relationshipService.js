const AppError = require('../errors/AppError');

const getSupabaseClient = () => {
  if (globalThis.__examsRelationshipSupabaseClient) {
    return globalThis.__examsRelationshipSupabaseClient;
  }

  if (globalThis.supabase) {
    return globalThis.supabase;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(url, key);
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

// simple in-memory caches with TTL to reduce repeated DB calls within the process
const parseTtl = (val, fallback) => {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const EXAM_METADATA_CACHE_TTL = parseTtl(process.env.EXAMS_METADATA_CACHE_TTL, 60); // seconds
const examCache = new Map(); // id -> { data, expiresAt }
const subjectCache = new Map();

const getCached = (cache, id) => {
  const entry = cache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(id);
    return null;
  }
  return entry.data;
};

const setCached = (cache, id, data) => {
  cache.set(id, { data, expiresAt: Date.now() + EXAM_METADATA_CACHE_TTL * 1000 });
};


const isParentOfStudent = async (parentId, studentId) => {
  if (!parentId || !studentId) {
    throw new AppError('Invalid parent/student identifiers', 400);
  }

  const client = getSupabaseClient();
  if (!client) {
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
    throw new AppError('Unable to resolve parent-student relationship', 500, response.error);
  }

  return Boolean(response?.data);
};

const getParentStudentIds = async (parentId) => {
  if (!parentId) {
    throw new AppError('Invalid parent identifier', 400);
  }

  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const response = await runQuery(
    client.from('parent_students')
      .select('student_id')
      .eq('parent_id', parentId)
  );

  if (response?.error) {
    throw new AppError('Unable to fetch parent-student relationships', 500, response.error);
  }

  return (response?.data || [])
    .map((row) => row?.student_id)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value));
};

const getTeacherClassIds = async (teacherId) => {
  if (!teacherId) {
    throw new AppError('Invalid teacher identifier', 400);
  }

  const client = getSupabaseClient();
  if (!client) {
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
      return [];
    }

    throw new AppError('Unable to fetch teacher-class relationships', 500, response.error);
  }

  return (response?.data || [])
    .map((row) => row?.class_id)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value));
};

const isTeacherAssignedToClass = async (teacherId, classId) => {
  if (!teacherId || !classId) {
    return false;
  }

  const teacherClassIds = await getTeacherClassIds(teacherId);
  return teacherClassIds.includes(String(classId));
};

const fetchExamById = async (examId) => {
  if (!examId) return null;
  const client = getSupabaseClient();
  if (!client) return null;
  // try cache first
  const cached = getCached(examCache, examId);
  if (cached) return cached;

  const response = await runQuery(
    client.from('exams').select('*').eq('id', examId).maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to fetch exam record', 500, response.error);
  }

  const data = response?.data || null;
  if (data) setCached(examCache, examId, data);
  return data;
};

const fetchSubjectById = async (subjectId) => {
  if (!subjectId) return null;
  const client = getSupabaseClient();
  if (!client) return null;
  const cached = getCached(subjectCache, subjectId);
  if (cached) return cached;

  const response = await runQuery(
    client.from('subjects').select('*').eq('id', subjectId).maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to fetch subject record', 500, response.error);
  }

  const data = response?.data || null;
  if (data) setCached(subjectCache, subjectId, data);
  return data;
};

// batch fetch utilities to reduce DB roundtrips for lists
const fetchExamsByIds = async (ids) => {
  const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)));
  const result = {};
  const missing = [];

  for (const id of uniqueIds) {
    const cached = getCached(examCache, id);
    if (cached) {
      result[id] = cached;
    } else {
      missing.push(id);
    }
  }

  if (missing.length === 0) return result;

  const client = getSupabaseClient();
  if (!client) {
    // when client not available, return only cached results
    return result;
  }

  const response = await runQuery(
    client.from('exams').select('*').in('id', missing)
  );

  if (response?.error) {
    throw new AppError('Unable to fetch exam records', 500, response.error);
  }

  for (const row of (response?.data || [])) {
    result[row.id] = row;
    setCached(examCache, row.id, row);
  }

  return result;
};

const fetchSubjectsByIds = async (ids) => {
  const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)));
  const result = {};
  const missing = [];

  for (const id of uniqueIds) {
    const cached = getCached(subjectCache, id);
    if (cached) {
      result[id] = cached;
    } else {
      missing.push(id);
    }
  }

  if (missing.length === 0) return result;

  const client = getSupabaseClient();
  if (!client) {
    return result;
  }

  const response = await runQuery(
    client.from('subjects').select('*').in('id', missing)
  );

  if (response?.error) {
    throw new AppError('Unable to fetch subject records', 500, response.error);
  }

  for (const row of (response?.data || [])) {
    result[row.id] = row;
    setCached(subjectCache, row.id, row);
  }

  return result;
};

const examExists = async (examId) => {
  if (!examId) return false;
  const client = getSupabaseClient();
  const requireDb = String(process.env.EXAMS_REQUIRE_DB_VALIDATION || '').toLowerCase() === 'true';
  if (!client) {
    if (requireDb) {
      throw new AppError('Database client not available for exam validation', 500);
    }
    return true; // can't validate without DB client - assume true for backward compatibility
  }

  const response = await runQuery(
    client.from('exams').select('id').eq('id', examId).maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to validate exam existence', 500, response.error);
  }

  return Boolean(response?.data);
};

const subjectExists = async (subjectId) => {
  if (!subjectId) return false;
  const client = getSupabaseClient();
  const requireDb = String(process.env.EXAMS_REQUIRE_DB_VALIDATION || '').toLowerCase() === 'true';
  if (!client) {
    if (requireDb) {
      throw new AppError('Database client not available for subject validation', 500);
    }
    return true; // can't validate without DB client - assume true for backward compatibility
  }

  const response = await runQuery(
    client.from('subjects').select('id').eq('id', subjectId).maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to validate subject existence', 500, response.error);
  }

  return Boolean(response?.data);
};

module.exports = {
  isParentOfStudent,
  getParentStudentIds,
  getTeacherClassIds,
  isTeacherAssignedToClass,
  fetchExamById,
  fetchSubjectById,
  examExists,
  subjectExists,
  fetchExamsByIds,
  fetchSubjectsByIds,
};

