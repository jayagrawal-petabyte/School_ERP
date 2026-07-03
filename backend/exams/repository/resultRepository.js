const AppError = require('../errors/AppError');

const getSupabaseClient = () => {
  if (globalThis.__examsRelationshipSupabaseClient) {
    return globalThis.__examsRelationshipSupabaseClient;
  }

  if (globalThis.supabase) {
    return globalThis.supabase;
  }

  const url = process.env.SUPABASE_URL;
  // prefer service role key on backend usage
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(url, key);
    // cache for reuse
    globalThis.__examsRelationshipSupabaseClient = client;
    return client;
  } catch (error) {
    return null;
  }
};

const normalizeResult = (row) => {
  if (!row) return null;

  const createdAt = row.created_at || row.createdAt || new Date().toISOString();
  const updatedAt = row.updated_at || row.updatedAt || createdAt;

  return {
    id: String(row.id),
    student_id: row.student_id ?? row.studentId ?? null,
    teacher_id: row.teacher_id ?? row.teacherId ?? null,
    class_id: row.class_id ?? row.classId ?? null,
    exam_id: row.exam_id ?? row.examType ?? null,
    subject_id: row.subject_id ?? row.subject ?? null,
    marks_obtained: row.marks_obtained ?? row.marks ?? null,
    max_marks: row.max_marks ?? row.maxMarks ?? 100,
    passing_marks: row.passing_marks ?? row.passingMarks ?? 33,
    status: row.status ?? null,
    created_at: createdAt,
    updated_at: updatedAt,
    // legacy aliases
    studentId: row.student_id ?? row.studentId ?? null,
    teacherId: row.teacher_id ?? row.teacherId ?? null,
    classId: row.class_id ?? row.classId ?? null,
    examType: row.exam_id ?? row.examType ?? null,
    subject: row.subject_id ?? row.subject ?? null,
    marks: row.marks_obtained ?? row.marks ?? null,
    createdAt,
    updatedAt,
  };
};

const ensureClient = () => {
  const client = getSupabaseClient();
  if (!client) {
    throw new AppError('Database client not available', 500);
  }
  return client;
};

const ALLOWED_INSERT_FIELDS = [
  'student_id',
  'teacher_id',
  'class_id',
  'exam_id',
  'subject_id',
  'marks_obtained',
  'max_marks',
  'passing_marks',
  'status',
];

const ALLOWED_UPDATE_FIELDS = [
  'teacher_id',
  'class_id',
  'exam_id',
  'subject_id',
  'marks_obtained',
  'max_marks',
  'passing_marks',
  'status',
];

const pick = (obj = {}, allowed = []) => {
  const out = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
      out[k] = obj[k];
    }
  }
  return out;
};

const quoteFilterValue = (value) => {
  const safe = String(value).replace(/"/g, '\\"');
  return `"${safe}"`;
};

const insertAuditRecord = async ({ resultId, oldValues, newValues, changedBy }) => {
  if (!resultId || !oldValues || !newValues) return null;

  const client = ensureClient();
  const response = await client
    .from('exam_marks_audit')
    .insert({
      result_id: resultId,
      old_values: oldValues,
      new_values: newValues,
      changed_by: changedBy || null,
      changed_at: new Date().toISOString(),
    })
    .select('id')
    .maybeSingle();

  if (response?.error) {
    throw new AppError('Unable to log result update audit', 500);
  }

  return response.data;
};

const create = async (resultData) => {
  const client = ensureClient();
  const payload = pick(resultData, ALLOWED_INSERT_FIELDS);
  payload.created_at = new Date().toISOString();
  payload.updated_at = payload.created_at;

  const response = await client
    .from('exam_marks')
    .insert(payload)
    .select('*')
    .maybeSingle();

  if (response?.error) {
    const duplicateMessage = String(response.error?.message || '') + ' ' + String(response.error?.details || '');
    if (/duplicate|unique constraint|already exists/i.test(duplicateMessage)) {
      throw new AppError('Duplicate result exists for student, exam, subject and class', 409);
    }
    throw new AppError('Unable to create result', 500);
  }

  return normalizeResult(response?.data || null);
};

const update = async (id, updates, expectedUpdatedAt = null, changedBy = null, existingResult = null) => {
  const client = ensureClient();

  const payload = pick(updates, ALLOWED_UPDATE_FIELDS);
  payload.updated_at = new Date().toISOString();

  let query = client.from('exam_marks').update(payload).eq('id', id);
  if (expectedUpdatedAt) {
    query = query.eq('updated_at', expectedUpdatedAt);
  }

  const response = await query.select('*').maybeSingle();

  if (response?.error) {
    throw new AppError('Unable to update result', 500);
  }

  if (!response?.data) {
    if (expectedUpdatedAt) {
      throw new AppError('Result was modified by another process', 409);
    }
    return null;
  }

  if (existingResult) {
    await insertAuditRecord({
      resultId: id,
      oldValues: existingResult,
      newValues: response.data,
      changedBy,
    });
  }

  return normalizeResult(response.data);
};

const findById = async (id) => {
  const client = ensureClient();

  const response = await client
    .from('exam_marks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (response?.error) {
    throw new AppError('Unable to fetch result', 500);
  }

  if (!response?.data) return null;
  return normalizeResult(response.data);
};

const buildQueryFromFilters = (qb, filters = {}) => {
  // simple equality filters: student_id, teacher_id, class_id, exam_id, subject_id, status
  const mapping = {
    student_id: 'student_id',
    studentId: 'student_id',
    teacher_id: 'teacher_id',
    teacherId: 'teacher_id',
    class_id: 'class_id',
    classId: 'class_id',
    exam_id: 'exam_id',
    examType: 'exam_id',
    subject_id: 'subject_id',
    subject: 'subject_id',
    status: 'status',
  };

  for (const key of Object.keys(filters || {})) {
    const col = mapping[key];
    const val = filters[key];
    if (!col || val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      qb = qb.in(col, val);
    } else {
      qb = qb.eq(col, val);
    }
  }
  return qb;
};

const applyPaginationAndSort = (qb, { limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'desc' } = {}) => {
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const safeOffset = Number(offset) || 0;
  const orderCol = String(sortBy || 'created_at');
  const orderDir = String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  qb = qb.order(orderCol, { ascending: orderDir === 'asc' });
  qb = qb.range(safeOffset, Math.max(0, safeOffset + safeLimit - 1));
  return { qb, limit: safeLimit, offset: safeOffset };
};

const findFiltered = async (filters = {}, options = {}) => {
  const client = ensureClient();
  let qb = client.from('exam_marks').select('*', { count: 'exact' });
  qb = buildQueryFromFilters(qb, filters);
  const { qb: pagedQb, limit, offset } = applyPaginationAndSort(qb, options);
  const response = await pagedQb;
  if (response?.error) {
    throw new AppError('Unable to fetch results', 500);
  }

  const total = typeof response.count === 'number' ? response.count : (response?.data || []).length;
  return {
    data: (response?.data || []).map(normalizeResult),
    pagination: {
      total,
      limit,
      offset,
    },
  };
};

const findPaginated = async (options = {}) => findFiltered({}, options);

const findByStudentIds = async (studentIds = [], options = {}) => findFiltered({ student_id: studentIds }, options);

const findByTeacher = async (teacherId, options = {}) => findFiltered({ teacher_id: teacherId }, options);

const findByTeacherOrClasses = async (teacherId, classIds = [], options = {}) => {
  const client = ensureClient();
  let qb = client.from('exam_marks').select('*', { count: 'exact' });

  if (teacherId && classIds && classIds.length > 0) {
    const classList = classIds.map((id) => quoteFilterValue(id)).join(',');
    qb = qb.or(`teacher_id.eq.${quoteFilterValue(teacherId)},class_id.in.(${classList})`);
  } else if (teacherId) {
    qb = qb.eq('teacher_id', teacherId);
  } else if (classIds && classIds.length > 0) {
    qb = qb.in('class_id', classIds);
  }

  const { qb: pagedQb, limit, offset } = applyPaginationAndSort(qb, options);
  const response = await pagedQb;
  if (response?.error) throw new AppError('Unable to fetch results', 500);
  const total = typeof response.count === 'number' ? response.count : (response?.data || []).length;
  return {
    data: (response?.data || []).map(normalizeResult),
    pagination: { total, limit, offset },
  };
};

const findAll = async () => {
  const resp = await findFiltered({}, { limit: 1000, offset: 0 });
  return resp.data;
};

module.exports = {
  create,
  update,
  findById,
  findAll,
  findByStudentIds,
  findByTeacher,
  findByTeacherOrClasses,
  findPaginated,
  findFiltered,
};
