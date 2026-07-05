const AppError = require('../errors/AppError');
const { normalizeResultShape } = require('../utils/resultUtils');
const { getSupabaseClient, runQuery } = require('../utils/supabaseClient');

let results = [];
let nextId = 1;

const normalizeResult = (result) => normalizeResultShape(result);
const isDevelopmentMode = () => process.env.NODE_ENV !== 'production';

const mapFilterKey = (key) => {
  const map = {
    studentId: 'student_id',
    teacherId: 'teacher_id',
    classId: 'class_id',
    examId: 'exam_id',
    subjectId: 'subject_id',
    status: 'status',
  };

  return map[key] || key;
};

const getSortColumn = (sortBy) => {
  const allowed = ['id', 'student_id', 'teacher_id', 'class_id', 'exam_id', 'subject_id', 'marks_obtained', 'max_marks', 'passing_marks', 'status', 'created_at', 'updated_at'];
  return allowed.includes(sortBy) ? sortBy : 'created_at';
};

const getSortOrder = (order) => (String(order || '').toLowerCase() === 'desc' ? 'desc' : 'asc');

const applyMemoryFilters = (rows, filters = {}) => rows.filter((row) => Object.entries(filters).every(([key, value]) => {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  const normalizedKey = mapFilterKey(key);
  const rowValue = row?.[normalizedKey];

  if (Array.isArray(value)) {
    return value.some((entry) => String(entry) === String(rowValue));
  }

  return String(rowValue) === String(value);
}));

const applyMemorySort = (rows, sortBy, order) => {
  const safeSortBy = getSortColumn(sortBy);
  const direction = getSortOrder(order) === 'desc' ? -1 : 1;

  return [...rows].sort((left, right) => {
    const leftValue = left?.[safeSortBy];
    const rightValue = right?.[safeSortBy];

    if (leftValue === rightValue) {
      return 0;
    }

    if (leftValue === undefined || leftValue === null) {
      return 1;
    }

    if (rightValue === undefined || rightValue === null) {
      return -1;
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
};

const create = async (resultData) => {
  const client = getSupabaseClient();
  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

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
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

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
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

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

const findAll = async (filters = {}, options = {}) => {
  const client = getSupabaseClient();
  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const allResults = (results || []).map((result) => normalizeResult(result));
    const filteredResults = applyMemoryFilters(allResults, filters);
    const sortedResults = applyMemorySort(filteredResults, options.sortBy, options.order);
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const start = (page - 1) * limit;

    return {
      success: true,
      page,
      limit,
      total: sortedResults.length,
      totalPages: sortedResults.length === 0 ? 0 : Math.ceil(sortedResults.length / limit),
      data: sortedResults.slice(start, start + limit),
    };
  }

  let query = client.from('exam_marks').select('*', { count: 'exact', head: false });
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    const column = mapFilterKey(key);
    if (Array.isArray(value) && value.length > 0) {
      query = query.in(column, value);
      return;
    }

    query = query.eq(column, value);
  });

  const sortBy = getSortColumn(options.sortBy);
  const ascending = getSortOrder(options.order) !== 'desc';
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 10));
  const start = (page - 1) * limit;

  if (typeof query.order === 'function') {
    query = query.order(sortBy, { ascending });
  }

  if (typeof query.range === 'function') {
    query = query.range(start, start + limit - 1);
  }

  const response = await runQuery(query);
  if (response?.error) {
    throw new AppError('Unable to fetch results', 500, response.error);
  }

  const data = (response.data || []).map((result) => normalizeResult(result));
  const total = typeof response.count === 'number' ? response.count : data.length;
  return {
    success: true,
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    data,
  };
};

module.exports = {
  create,
  update,
  findById,
  findAll,
};
