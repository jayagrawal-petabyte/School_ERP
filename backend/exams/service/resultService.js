const AppError = require('../errors/AppError');
const resultRepository = require('../repository/resultRepository');
const relationshipService = require('./relationshipService');
const ROLES = require('../constants/roles');
const { deriveStatus, normalizeIds } = require('../utils/resultUtils');

const getFieldValue = (data, keys, fallbackValue) => {
  for (const key of keys) {
    const value = data?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return fallbackValue;
};

const getExistingValue = (existingResult, keys) => getFieldValue(existingResult, keys);
const getUserRole = (user = {}) => String(user?.role || '').toLowerCase();
const isAdminOrPrincipal = (user = {}) => {
  const role = getUserRole(user);
  return role === ROLES.ADMIN || role === ROLES.PRINCIPAL;
};

const getResultStudentId = (result = {}) => result.student_id || result.studentId;
const getResultTeacherId = (result = {}) => result.teacher_id || result.teacherId;
const getResultClassId = (result = {}) => result.class_id || result.classId;

const assertResultAccess = async (user, result, { requireOwnership = false } = {}) => {
  if (!result) {
    throw new AppError('Result not found', 404);
  }

  if (isAdminOrPrincipal(user)) {
    return result;
  }

  const role = getUserRole(user);
  if (role === ROLES.STUDENT) {
    if (String(getResultStudentId(result)) !== String(user.id)) {
      throw new AppError('Forbidden', 403);
    }
    return result;
  }

  if (role === ROLES.PARENT) {
    const parentStudentIds = await relationshipService.getParentStudentIds(user.id);
    if (!parentStudentIds.includes(String(getResultStudentId(result)))) {
      throw new AppError('Forbidden', 403);
    }
    return result;
  }

  if (role === ROLES.TEACHER) {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id);
    const teacherOwnsResult = String(getResultTeacherId(result)) === String(user.id);
    const classAssigned = teacherClassIds.includes(String(getResultClassId(result)));

    if (requireOwnership) {
      if (!teacherOwnsResult) {
        throw new AppError('Forbidden', 403);
      }
      return result;
    }

    if (!teacherOwnsResult && !classAssigned) {
      throw new AppError('Forbidden', 403);
    }

    return result;
  }

  throw new AppError('Forbidden', 403);
};

const validateNumber = (value, name, { min, max, required = true } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new AppError(`${name} is required`, 400);
    }
    return undefined;
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue) || typeof value === 'boolean') {
    throw new AppError(`${name} must be a number`, 400);
  }

  if (min !== undefined && numberValue < min) {
    throw new AppError(`${name} must be greater than or equal to ${min}`, 400);
  }

  if (max !== undefined && numberValue > max) {
    throw new AppError(`${name} must be less than or equal to ${max}`, 400);
  }

  return numberValue;
};

const attachMetadata = (results, exams = [], subjects = []) => {
  const examMap = new Map((exams || []).map((exam) => [String(exam.id), exam]));
  const subjectMap = new Map((subjects || []).map((subject) => [String(subject.id), subject]));

  return results.map((result) => {
  const examId = String(result.exam_id ?? '');
    const subjectId = String(result.subject_id ?? result.subject ?? '');
    const exam = examMap.get(examId) || null;
    const subject = subjectMap.get(subjectId) || null;

    return {
      ...result,
      exam_meta: exam
        ? {
            id: exam.id,
            name: exam.name,
            term: exam.term,
            academic_year: exam.academic_year,
            class_id: exam.class_id,
          }
        : null,
      subject_meta: subject
        ? {
            id: subject.id,
            name: subject.name,
            class_id: subject.class_id,
            sub_code: subject.sub_code,
          }
        : null,
    };
  });
};

const enrichResultsWithMetadata = async (results) => {
  console.log('[Service] enrichResultsWithMetadata - Input results count:', results?.length || 0);
  if (!Array.isArray(results) || results.length === 0) {
    console.log('[Service] enrichResultsWithMetadata - No results to enrich');
    return results;
  }

  const examIds = normalizeIds(results.map((result) => result.exam_id));
  const subjectIds = normalizeIds(results.map((result) => result.subject_id ?? result.subject));
  console.log('[Service] enrichResultsWithMetadata - Exam IDs to fetch:', examIds);
  console.log('[Service] enrichResultsWithMetadata - Subject IDs to fetch:', subjectIds);

  const [exams, subjects] = await Promise.all([
    examIds.length > 0 ? relationshipService.fetchExamsByIds(examIds) : [],
    subjectIds.length > 0 ? relationshipService.fetchSubjectsByIds(subjectIds) : [],
  ]);

  console.log('[Service] enrichResultsWithMetadata - Fetched exams:', exams?.length || 0, 'Fetched subjects:', subjects?.length || 0);
  const enriched = attachMetadata(results, exams || [], subjects || []);
  console.log('[Service] enrichResultsWithMetadata - Metadata attached to', enriched.length, 'results');
  return enriched;
};

const normalizeResultPayload = (data, user, { isUpdate = false, existingResult = {} } = {}) => {
  const studentId = getFieldValue(data, ['student_id', 'studentId'], getExistingValue(existingResult, ['student_id', 'studentId']));
  const teacherId = getFieldValue(data, ['teacher_id', 'teacherId'], getExistingValue(existingResult, ['teacher_id', 'teacherId']));
  const subjectId = getFieldValue(data, ['subject_id', 'subject'], getExistingValue(existingResult, ['subject_id', 'subject']));
  const examId = getFieldValue(data, ['exam_id', 'examId'], getExistingValue(existingResult, ['exam_id', 'examId']));
  const classId = getFieldValue(data, ['class_id', 'classId'], getExistingValue(existingResult, ['class_id', 'classId']));
  const marksObtained = getFieldValue(data, ['marks_obtained', 'marks'], getExistingValue(existingResult, ['marks_obtained', 'marks']));
  const maxMarks = getFieldValue(data, ['max_marks', 'maxMarks'], getExistingValue(existingResult, ['max_marks', 'maxMarks']));
  const passingMarks = getFieldValue(data, ['passing_marks', 'passingMarks'], getExistingValue(existingResult, ['passing_marks', 'passingMarks']));

  if (!isUpdate && !studentId) {
    throw new AppError('Student ID is required', 400);
  }

  if (!isUpdate && !subjectId) {
    throw new AppError('Subject is required', 400);
  }

  if (!isUpdate && !examId) {
    throw new AppError('Exam type is required', 400);
  }

  if (!isUpdate && !classId) {
    throw new AppError('Class ID is required', 400);
  }

  const resolvedMaxMarks = validateNumber(maxMarks ?? 100, 'max_marks', { min: 1, required: false }) ?? (maxMarks ?? 100);
  const resolvedPassingMarks = validateNumber(passingMarks ?? Math.min(33, resolvedMaxMarks), 'passing_marks', { min: 0, max: resolvedMaxMarks, required: false }) ?? (passingMarks ?? Math.min(33, resolvedMaxMarks));
  const resolvedMarksObtained = validateNumber(marksObtained, 'marks_obtained', { min: 0, required: !isUpdate }) ?? (isUpdate ? marksObtained : 0);

  if (resolvedMarksObtained !== undefined && resolvedMarksObtained > resolvedMaxMarks) {
    throw new AppError('marks_obtained cannot exceed max_marks', 400);
  }

  const userRole = String(user?.role || '').toLowerCase();
  const resolvedTeacherId = teacherId || user?.id || existingResult?.teacher_id || existingResult?.teacherId;

  return {
    student_id: studentId,
    teacher_id: userRole === ROLES.ADMIN || userRole === ROLES.PRINCIPAL ? resolvedTeacherId : user?.id || resolvedTeacherId,
    class_id: classId,
    exam_id: examId,
    subject_id: subjectId,
    marks_obtained: resolvedMarksObtained,
    max_marks: resolvedMaxMarks,
    passing_marks: resolvedPassingMarks,
    status: deriveStatus(resolvedMarksObtained, resolvedPassingMarks),
  };
};

const ensureExamExists = async (examId) => {
  if (!examId) {
    return false;
  }

  const exams = await relationshipService.fetchExamsByIds([examId]);
  if (exams === null) {
    return true;
  }

  return Array.isArray(exams) && exams.length > 0;
};

const ensureSubjectExists = async (subjectId) => {
  if (!subjectId) {
    return false;
  }

  const subjects = await relationshipService.fetchSubjectsByIds([subjectId]);
  if (subjects === null) {
    return true;
  }

  return Array.isArray(subjects) && subjects.length > 0;
};

const createResult = async (data, user) => {
  console.log('[Service] createResult - Input data:', data);
  console.log('[Service] createResult - User:', user);
  const resultPayload = normalizeResultPayload(data, user, { isUpdate: false });
  console.log('[Service] createResult - Normalized payload:', resultPayload);

  if (!(await ensureExamExists(resultPayload.exam_id))) {
    console.error('[Service] createResult - Exam does not exist:', resultPayload.exam_id);
    throw new AppError('exam_id does not reference an existing exam', 400);
  }

  if (!(await ensureSubjectExists(resultPayload.subject_id))) {
    console.error('[Service] createResult - Subject does not exist:', resultPayload.subject_id);
    throw new AppError('subject_id does not reference an existing subject', 400);
  }

  // Teachers may only create results for their assigned classes or for their own assigned result records.
  if (!isAdminOrPrincipal(user) && getUserRole(user) === ROLES.TEACHER) {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id);
    const classAllowed = teacherClassIds.includes(String(resultPayload.class_id));
    const teacherOwnsResult = String(resultPayload.teacher_id) === String(user.id);
    if (!classAllowed && !teacherOwnsResult) {
      console.error('[Service] createResult - Teacher not authorized for class:', resultPayload.class_id);
      throw new AppError('Forbidden', 403);
    }
  }

  const result = await resultRepository.create(resultPayload);
  console.log('[Service] createResult - Result created with ID:', result.id);
  return enrichResultsWithMetadata([result]).then((items) => items[0]);
};

const updateResult = async (id, data, options = {}) => {
  console.log('[Service] updateResult - ID:', id);
  console.log('[Service] updateResult - Data:', data);
  const existingResult = options.resourceOwner || await resultRepository.findById(id);
  if (!existingResult) {
    console.error('[Service] updateResult - Result not found:', id);
    throw new AppError('Result not found', 404);
  }

  await assertResultAccess(options.user || {}, existingResult, { requireOwnership: true });

  const normalizedPayload = normalizeResultPayload(data, {}, { isUpdate: true, existingResult });
  console.log('[Service] updateResult - Normalized payload:', normalizedPayload);
  const updates = {};
  const marksChanged = data?.marks_obtained !== undefined || data?.marks !== undefined;
  const passingChanged = data?.passing_marks !== undefined || data?.passingMarks !== undefined;
  const maxChanged = data?.max_marks !== undefined || data?.maxMarks !== undefined;

  if (marksChanged) {
    updates.marks_obtained = normalizedPayload.marks_obtained;
  }
  if (data?.subject_id !== undefined || data?.subject !== undefined) {
    updates.subject_id = normalizedPayload.subject_id;
  }
  if (data?.exam_id !== undefined) {
    updates.exam_id = normalizedPayload.exam_id;
  }
  if (data?.class_id !== undefined || data?.classId !== undefined) {
    updates.class_id = normalizedPayload.class_id;
  }
  if (maxChanged) {
    updates.max_marks = normalizedPayload.max_marks;
  }
  if (passingChanged) {
    updates.passing_marks = normalizedPayload.passing_marks;
  }

  if (Object.keys(updates).length > 0) {
    updates.status = normalizedPayload.status;
  }

  if (updates.exam_id && !(await ensureExamExists(updates.exam_id))) {
    console.error('[Service] updateResult - Exam does not exist:', updates.exam_id);
    throw new AppError('exam_id does not reference an existing exam', 400);
  }

  if (updates.subject_id && !(await ensureSubjectExists(updates.subject_id))) {
    console.error('[Service] updateResult - Subject does not exist:', updates.subject_id);
    throw new AppError('subject_id does not reference an existing subject', 400);
  }

  if (Object.keys(updates).length === 0) {
    console.log('[Service] updateResult - No updates needed');
    const [enriched] = await enrichResultsWithMetadata([existingResult]);
    return enriched;
  }

  const updatedResult = await resultRepository.update(id, updates);
  console.log('[Service] updateResult - Result updated, applying metadata');
  return enrichResultsWithMetadata([updatedResult]).then((items) => items[0]);
};

const getResultById = async (id, options = {}) => {
  console.log('[Service] getResultById - ID:', id);
  const result = options.resourceOwner || await resultRepository.findById(id);
  await assertResultAccess(options.user || {}, result);

  const [enriched] = await enrichResultsWithMetadata([result]);
  console.log('[Service] getResultById - Result enriched:', enriched);
  return enriched;
};

const createEmptyResponse = (options = {}) => {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 10));

  return {
    success: true,
    page,
    limit,
    total: 0,
    totalPages: 0,
    data: [],
  };
};

const fetchRoleScopedResults = async (user, filters = {}, options = {}) => {
  console.log('[Service] fetchRoleScopedResults - User role:', user.role, 'Filters:', filters);
  const role = String(user.role).toLowerCase();

  if (role === ROLES.ADMIN || role === ROLES.PRINCIPAL) {
    console.log('[Service] fetchRoleScopedResults - Admin/Principal role: returning all results');
    return resultRepository.findAll(filters, options);
  }

  if (role === ROLES.STUDENT) {
    console.log('[Service] fetchRoleScopedResults - Student role: filtering by student ID');
    return resultRepository.findAll({ ...filters, student_id: user.id }, options);
  }

  if (role === ROLES.PARENT) {
    console.log('[Service] fetchRoleScopedResults - Parent role: fetching parent-student relationships');
    const parentStudentIds = await relationshipService.getParentStudentIds(user.id);
    console.log('[Service] fetchRoleScopedResults - Parent student IDs:', parentStudentIds);
    if (!Array.isArray(parentStudentIds) || parentStudentIds.length === 0) {
      console.log('[Service] fetchRoleScopedResults - No students found for parent');
      return createEmptyResponse(options);
    }

    return resultRepository.findAll({ ...filters, student_id: parentStudentIds }, options);
  }

  if (role === ROLES.TEACHER) {
    console.log('[Service] fetchRoleScopedResults - Teacher role: fetching teacher-class relationships');
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id);
    console.log('[Service] fetchRoleScopedResults - Teacher class IDs:', teacherClassIds);
    const teacherQuery = resultRepository.findAll({ ...filters, teacher_id: user.id }, { ...options, page: 1, limit: 1000 });
    const classQuery = teacherClassIds.length > 0
      ? resultRepository.findAll({ ...filters, class_id: teacherClassIds }, { ...options, page: 1, limit: 1000 })
      : Promise.resolve(createEmptyResponse({ ...options, page: 1, limit: 1000 }));

    const [teacherResponse, classResponse] = await Promise.all([teacherQuery, classQuery]);
    console.log('[Service] fetchRoleScopedResults - Teacher results:', teacherResponse?.data?.length || 0, 'Class results:', classResponse?.data?.length || 0);
    const mergedResults = [...(teacherResponse?.data || []), ...(classResponse?.data || [])];
    const uniqueResults = mergedResults.filter((result, index, rows) => rows.findIndex((entry) => String(entry.id) === String(result.id)) === index);
    console.log('[Service] fetchRoleScopedResults - Merged and deduplicated results count:', uniqueResults.length);

    return {
      success: true,
      page: Math.max(1, Number(options.page || 1)),
      limit: Math.max(1, Number(options.limit || 10)),
      total: uniqueResults.length,
      totalPages: uniqueResults.length === 0 ? 0 : Math.ceil(uniqueResults.length / Math.max(1, Number(options.limit || 10))),
      data: uniqueResults,
    };
  }

  console.log('[Service] fetchRoleScopedResults - Unknown role');
  return createEmptyResponse(options);
};

const getAllResults = async (user, options = {}) => {
  console.log('[Service] getAllResults - User role:', user.role, 'Options:', options);
  const role = String(user.role).toLowerCase();
  const normalizedOptions = {
    page: Number(options.page || 1),
    limit: Number(options.limit || 10),
    sortBy: options.sortBy,
    order: options.order,
    filters: options.filters || {},
  };

  const response = await fetchRoleScopedResults(user, normalizedOptions.filters, normalizedOptions);
  const results = Array.isArray(response?.data) ? response.data : [];
  console.log('[Service] getAllResults - Fetched', results.length, 'results before sorting');
  
  const sortedResults = sortResults(results, normalizedOptions.sortBy, normalizedOptions.order);
  const paginated = paginateResults(sortedResults, normalizedOptions);
  console.log('[Service] getAllResults - Paginated:', { page: paginated.page, limit: paginated.limit, total: paginated.total });
  
  const enriched = await enrichResultsWithMetadata(paginated.data);
  console.log('[Service] getAllResults - Enriched', enriched.length, 'results');
  return { ...paginated, data: enriched };
};

const applyQueryFilters = (results, filters = {}) => results.filter((result) => Object.entries(filters).every(([key, value]) => {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  const rowValue = result?.[key] ?? result?.[key.toLowerCase()] ?? result?.[camelizeKey(key)];
  if (Array.isArray(value)) {
    return value.some((entry) => String(entry) === String(rowValue));
  }

  return String(rowValue) === String(value);
}));

const camelizeKey = (key) => {
  const map = {
    studentId: 'student_id',
    teacherId: 'teacher_id',
    classId: 'class_id',
    examId: 'exam_id',
    subjectId: 'subject_id',
  };

  return map[key] || key;
};

const sortResults = (results, sortBy, order) => {
  const allowedFields = ['id', 'student_id', 'teacher_id', 'class_id', 'exam_id', 'subject_id', 'marks_obtained', 'max_marks', 'passing_marks', 'status', 'created_at', 'updated_at'];
  const safeSortBy = allowedFields.includes(sortBy) ? sortBy : 'created_at';
  const direction = String(order || '').toLowerCase() === 'desc' ? -1 : 1;

  return [...results].sort((left, right) => {
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

const paginateResults = (results, options = {}) => {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 10));
  const total = results.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = results.slice(start, start + limit);

  return {
    success: true,
    page,
    limit,
    total,
    totalPages,
    data,
  };
};

const getMyResults = async (user) => {
  console.log('[Service] getMyResults - User ID:', user.id, 'Role:', user.role);
  const response = await resultRepository.findAll({ student_id: user.id }, { page: 1, limit: 1000 });
  console.log('[Service] getMyResults - Found', response?.data?.length || 0, 'results');
  const enriched = await enrichResultsWithMetadata(response?.data || []);
  console.log('[Service] getMyResults - Enriched', enriched.length, 'results');
  return enriched;
};

const getOwnershipContext = async (id) => {
  const result = await resultRepository.findById(id);
  if (!result) {
    return null;
  }

  // Return the full result record so the middleware and service layers can reuse it without re-querying.
  return {
    ...result,
    studentId: result.student_id || result.studentId,
    student_id: result.student_id || result.studentId,
    teacherId: result.teacher_id || result.teacherId,
    teacher_id: result.teacher_id || result.teacherId,
    classId: result.class_id || result.classId,
    class_id: result.class_id || result.classId,
    assignedTeacherIds: result.assignedTeacherIds || [],
  };
};

module.exports = {
  createResult,
  updateResult,
  getResultById,
  getAllResults,
  getMyResults,
  getOwnershipContext,
};
