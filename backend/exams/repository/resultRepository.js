const AppError = require('../errors/AppError');

let results = [];
let nextId = 1;

const getSupabaseClient = () => {
  if (globalThis.__examsResultSupabaseClient) {
    return globalThis.__examsResultSupabaseClient;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    globalThis.__examsResultSupabaseClient = client;
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

const deriveStatus = (marksObtained, passingMarks) => {
  if (marksObtained === undefined || marksObtained === null || marksObtained === '') {
    return 'pending';
  }

  return Number(marksObtained) >= Number(passingMarks || 0) ? 'pass' : 'fail';
};

const normalizeResult = (result) => {
  if (!result) {
    return null;
  }

  const createdAt = result.created_at || result.createdAt || new Date().toISOString();
  const updatedAt = result.updated_at || result.updatedAt || createdAt;

  return {
    ...result,
    id: String(result.id),
    student_id: result.student_id ?? result.studentId ?? null,
    teacher_id: result.teacher_id ?? result.teacherId ?? null,
    class_id: result.class_id ?? result.classId ?? null,
    exam_id: result.exam_id ?? result.examType ?? null,
    subject_id: result.subject_id ?? result.subject ?? null,
    marks_obtained: result.marks_obtained ?? result.marks ?? null,
    max_marks: result.max_marks ?? result.maxMarks ?? 100,
    passing_marks: result.passing_marks ?? result.passingMarks ?? 33,
    status: result.status ?? deriveStatus(result.marks_obtained ?? result.marks, result.passing_marks ?? result.passingMarks ?? 33),
    created_at: createdAt,
    updated_at: updatedAt,
    studentId: result.student_id ?? result.studentId ?? null,
    teacherId: result.teacher_id ?? result.teacherId ?? null,
    classId: result.class_id ?? result.classId ?? null,
    examType: result.exam_id ?? result.examType ?? null,
    subject: result.subject_id ?? result.subject ?? null,
    marks: result.marks_obtained ?? result.marks ?? null,
    createdAt,
    updatedAt,
  };
};

const create = async (resultData) => {
  const client = getSupabaseClient();
  if (!client) {
    const result = normalizeResult({
      id: String(nextId++),
      ...resultData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    results.push(result);
    return result;
  }

  const response = await runQuery(
    client.from('exam_marks')
      .insert(resultData)
      .select('*')
      .single()
  );

  if (response?.error) {
    throw new AppError('Unable to create result', 500, response.error);
  }

  return normalizeResult(response.data);
};

const update = async (id, updates) => {
  const client = getSupabaseClient();
  if (!client) {
    const index = results.findIndex((result) => result.id === String(id));
    if (index === -1) {
      return null;
    }

    const existingResult = results[index];
    const updatedResult = normalizeResult({
      ...existingResult,
      ...updates,
      updated_at: new Date().toISOString(),
    });

    results[index] = updatedResult;
    return updatedResult;
  }

  const response = await runQuery(
    client.from('exam_marks')
      .update(updates)
      .eq('id', String(id))
      .select('*')
      .single()
  );

  if (response?.error) {
    throw new AppError('Unable to update result', 500, response.error);
  }

  return response.data ? normalizeResult(response.data) : null;
};

const findById = async (id) => {
  const client = getSupabaseClient();
  if (!client) {
    const result = results.find((item) => item.id === String(id));
    return result ? normalizeResult(result) : null;
  }

  const response = await runQuery(
    client.from('exam_marks')
      .select('*')
      .eq('id', String(id))
      .maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to fetch result', 500, response.error);
  }

  return response.data ? normalizeResult(response.data) : null;
};

const findAll = async () => {
  const client = getSupabaseClient();
  if (!client) {
    return results.map((result) => normalizeResult(result));
  }

  const response = await runQuery(
    client.from('exam_marks')
      .select('*')
  );

  if (response?.error) {
    throw new AppError('Unable to fetch results', 500, response.error);
  }

  return (response.data || []).map((result) => normalizeResult(result));
};

module.exports = {
  create,
  update,
  findById,
  findAll,
};
