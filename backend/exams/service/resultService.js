const AppError = require('../errors/AppError');
const resultRepository = require('../repository/resultRepository');
const relationshipService = require('./relationshipService');
const { deriveStatus, pickExam, pickSubject } = require('../utils/resultUtils');

const getFieldValue = (data, keys) => {
  for (const key of keys) {
    const value = data?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
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

const normalizeResultPayload = (data, user, { isUpdate = false } = {}) => {
  const studentId = getFieldValue(data, ['student_id', 'studentId']);
  const teacherId = getFieldValue(data, ['teacher_id', 'teacherId']);
  const subjectId = getFieldValue(data, ['subject_id', 'subject']);
  const examId = getFieldValue(data, ['exam_id', 'examType']);
  const classId = getFieldValue(data, ['class_id', 'classId']);
  const marksObtained = getFieldValue(data, ['marks_obtained', 'marks']);
  const maxMarks = getFieldValue(data, ['max_marks', 'maxMarks']);
  const passingMarks = getFieldValue(data, ['passing_marks', 'passingMarks']);

  if (!isUpdate && !studentId) {
    throw new AppError('Student ID is required', 400);
  }

  if (!isUpdate && !subjectId) {
    throw new AppError('subject_id is required', 400);
  }

  if (!isUpdate && !examId) {
    throw new AppError('exam_id is required', 400);
  }

  if (!isUpdate && !classId) {
    throw new AppError('class_id is required', 400);
  }

  const resolvedMaxMarks = validateNumber(maxMarks ?? 100, 'max_marks', { min: 1, required: false }) ?? 100;
  const resolvedPassingMarks = validateNumber(passingMarks ?? Math.min(33, resolvedMaxMarks), 'passing_marks', { min: 0, max: resolvedMaxMarks, required: false }) ?? Math.min(33, resolvedMaxMarks);
  const resolvedMarksObtained = validateNumber(marksObtained, 'marks_obtained', { min: 0, required: false });

  if (resolvedMarksObtained !== undefined && resolvedMarksObtained !== null && resolvedMarksObtained > resolvedMaxMarks) {
    throw new AppError('marks_obtained cannot exceed max_marks', 400);
  }

  const userRole = String(user?.role || '').toLowerCase();
  const resolvedTeacherId = teacherId || user?.id;

  if (userRole === 'teacher' && teacherId && String(teacherId) !== String(user?.id)) {
    throw new AppError('Teachers cannot assign results to other teachers', 403);
  }

  return {
    student_id: studentId,
    teacher_id: userRole === 'admin' || userRole === 'principal' ? resolvedTeacherId : user?.id,
    class_id: classId,
    exam_id: examId,
    subject_id: subjectId,
    marks_obtained: resolvedMarksObtained,
    max_marks: resolvedMaxMarks,
    passing_marks: resolvedPassingMarks,
  };
};

const createResult = async (data, user) => {
  const resultPayload = normalizeResultPayload(data, user, { isUpdate: false });

  const examOk = await relationshipService.examExists(resultPayload.exam_id);
  if (!examOk) {
    throw new AppError('Exam not found', 400);
  }

  const subjectOk = await relationshipService.subjectExists(resultPayload.subject_id);
  if (!subjectOk) {
    throw new AppError('Subject not found', 400);
  }

  const userRole = String(user.role).toLowerCase();
  if (userRole === 'teacher') {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id);
    if (!teacherClassIds.includes(String(resultPayload.class_id))) {
      throw new AppError('Forbidden: Teacher is not assigned to this class', 403);
    }
  }

  resultPayload.status = deriveStatus(resultPayload.marks_obtained, resultPayload.passing_marks);

  const created = await resultRepository.create(resultPayload);
  return getResultById(created.id);
};

const updateResult = async (id, data, user) => {
  const existingResult = await resultRepository.findById(id);
  if (!existingResult) {
    throw new AppError('Result not found', 404);
  }

  const updates = {};
  const normalizedPayload = normalizeResultPayload(data, user, { isUpdate: true });

  if (data?.marks_obtained !== undefined || data?.marks !== undefined) {
    updates.marks_obtained = normalizedPayload.marks_obtained;
  }
  if (data?.subject_id !== undefined || data?.subject !== undefined) {
    updates.subject_id = normalizedPayload.subject_id;
  }
  if (data?.exam_id !== undefined || data?.examType !== undefined) {
    updates.exam_id = normalizedPayload.exam_id;
  }
  if (data?.class_id !== undefined || data?.classId !== undefined) {
    updates.class_id = normalizedPayload.class_id;
  }
  if (data?.max_marks !== undefined || data?.maxMarks !== undefined) {
    updates.max_marks = normalizedPayload.max_marks;
  }
  if (data?.passing_marks !== undefined || data?.passingMarks !== undefined) {
    updates.passing_marks = normalizedPayload.passing_marks;
  }

  if (Object.keys(updates).length === 0) {
    return getResultById(id);
  }

  const role = String(user.role).toLowerCase();
  if (role === 'teacher') {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id);
    const targetClassId = updates.class_id || existingResult.class_id || existingResult.classId;
    if (!teacherClassIds.includes(String(targetClassId))) {
      throw new AppError('Forbidden: Teacher is not assigned to this class', 403);
    }
  }

  if (updates.exam_id) {
    const examOk = await relationshipService.examExists(updates.exam_id);
    if (!examOk) {
      throw new AppError('Exam not found', 400);
    }
  }

  if (updates.subject_id) {
    const subjectOk = await relationshipService.subjectExists(updates.subject_id);
    if (!subjectOk) {
      throw new AppError('Subject not found', 400);
    }
  }

  const finalMax = updates.max_marks !== undefined ? Number(updates.max_marks) : Number(existingResult.max_marks || existingResult.maxMarks || 100);
  const finalPassing = updates.passing_marks !== undefined ? Number(updates.passing_marks) : Number(existingResult.passing_marks || existingResult.passingMarks || Math.min(33, finalMax));
  const existingMarks = existingResult.marks_obtained !== undefined && existingResult.marks_obtained !== null
    ? Number(existingResult.marks_obtained)
    : null;
  const finalMarks = updates.marks_obtained !== undefined
    ? Number(updates.marks_obtained)
    : existingMarks;

  if (Number.isNaN(finalMax) || finalMax <= 0) {
    throw new AppError('max_marks must be greater than 0', 400);
  }

  if (finalMarks !== null && !Number.isNaN(finalMarks) && finalMarks > finalMax) {
    throw new AppError('marks_obtained cannot exceed max_marks', 400);
  }

  if (!Number.isNaN(finalPassing) && finalPassing > finalMax) {
    throw new AppError('passing_marks cannot exceed max_marks', 400);
  }

  updates.status = deriveStatus(finalMarks, finalPassing);

  const expectedUpdatedAt = data?.updated_at || data?.updatedAt || null;
  if (!expectedUpdatedAt) {
    throw new AppError('Missing optimistic lock token', 409);
  }

  await resultRepository.update(id, updates, expectedUpdatedAt, user.id, existingResult);
  return getResultById(id);
};

const getResultById = async (id) => {
  const result = await resultRepository.findById(id);
  if (!result) {
    throw new AppError('Result not found', 404);
  }
  // attach exam/subject metadata when available
  try {
    const [exam, subject] = await Promise.all([
      relationshipService.fetchExamById(result.exam_id || result.examType),
      relationshipService.fetchSubjectById(result.subject_id || result.subject),
    ]);

    if (exam) result.exam_meta = pickExam(exam);
    if (subject) result.subject_meta = pickSubject(subject);
  } catch (e) {
    // non-fatal: don't block result retrieval for metadata errors
  }

  return result;
};

const getAllResults = async (user, query = {}) => {
  const role = String(user.role).toLowerCase();
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || 'created_at';
  const sortOrder = query.sortOrder || 'desc';

  // admin/principal: full access
  if (role === 'admin' || role === 'principal') {
    const resp = await resultRepository.findFiltered({}, { limit, offset, sortBy, sortOrder });
    const results = await attachMetadataToResults(resp.data);
    return {
      data: results,
      pagination: {
        page,
        limit,
        total: resp.pagination.total || 0,
        total_pages: Math.ceil((resp.pagination.total || 0) / limit),
      },
    };
  }

  if (role === 'teacher') {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id);
    const resp = await resultRepository.findByTeacherOrClasses(user.id, teacherClassIds, { limit, offset, sortBy, sortOrder });
    const rows = await attachMetadataToResults(resp.data);
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: resp.pagination.total || rows.length,
        total_pages: Math.ceil((resp.pagination.total || rows.length) / limit),
      },
    };
  }

  if (role === 'parent') {
    const parentStudentIds = await relationshipService.getParentStudentIds(user.id);
    const resp = await resultRepository.findByStudentIds(parentStudentIds, { limit, offset, sortBy, sortOrder });
    const rows = await attachMetadataToResults(resp.data);
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: resp.pagination.total || rows.length,
        total_pages: Math.ceil((resp.pagination.total || rows.length) / limit),
      },
    };
  }

  if (role === 'student') {
    throw new AppError('Students are not allowed to view all results', 403);
  }

  return { data: [], pagination: { page, limit, total: 0, total_pages: 0 } };
};

const attachMetadataToResults = async (results) => {
  if (!Array.isArray(results) || results.length === 0) return results;
  // collect unique ids
  const examIds = [];
  const subjectIds = [];
  for (const r of results) {
    const eId = r.exam_id || r.examType;
    const sId = r.subject_id || r.subject;
    if (eId) examIds.push(eId);
    if (sId) subjectIds.push(sId);
  }

  try {
    const [examsMap, subjectsMap] = await Promise.all([
      relationshipService.fetchExamsByIds(examIds),
      relationshipService.fetchSubjectsByIds(subjectIds),
    ]);

    return results.map((result) => {
      try {
        const eId = result.exam_id || result.examType;
        const sId = result.subject_id || result.subject;
        if (eId && examsMap && examsMap[eId]) result.exam_meta = pickExam(examsMap[eId]);
        if (sId && subjectsMap && subjectsMap[sId]) result.subject_meta = pickSubject(subjectsMap[sId]);
      } catch (e) {
        // ignore per-result attach errors
      }
      return result;
    });
  } catch (e) {
    // if batch fetch fails, fall back to returning results without metadata
    return results;
  }
};

const getMyResults = async (user, query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || 'created_at';
  const sortOrder = query.sortOrder || 'desc';

  const resp = await resultRepository.findByStudentIds([String(user.id)], { limit, offset, sortBy, sortOrder });
  const rows = await attachMetadataToResults(resp.data);
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: resp.pagination.total || rows.length,
      total_pages: Math.ceil((resp.pagination.total || rows.length) / limit),
    },
  };
};

const getOwnershipContext = async (id) => {
  const result = await resultRepository.findById(id);
  if (!result) {
    return null;
  }

  return {
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
