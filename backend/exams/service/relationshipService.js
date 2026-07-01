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

module.exports = {
  isParentOfStudent,
  getParentStudentIds,
  getTeacherClassIds,
  isTeacherAssignedToClass,
};
