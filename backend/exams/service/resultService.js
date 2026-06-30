const AppError = require('../errors/AppError');
const resultRepository = require('../repository/resultRepository');
const relationshipService = require('./relationshipService');

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

const deriveStatus = (marksObtained, passingMarks) => {
  if (marksObtained === undefined || marksObtained === null || marksObtained === '') {
    return 'pending';
  }

  return Number(marksObtained) >= Number(passingMarks || 0) ? 'pass' : 'fail';
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
    throw new AppError('Subject is required', 400);
  }

  if (!isUpdate && !examId) {
    throw new AppError('Exam type is required', 400);
  }

  const resolvedMaxMarks = validateNumber(maxMarks ?? 100, 'max_marks', { min: 1, required: false }) ?? 100;
  const resolvedPassingMarks = validateNumber(passingMarks ?? Math.min(33, resolvedMaxMarks), 'passing_marks', { min: 0, max: resolvedMaxMarks, required: false }) ?? Math.min(33, resolvedMaxMarks);
  const resolvedMarksObtained = validateNumber(marksObtained, 'marks_obtained', { min: 0, required: !isUpdate }) ?? (isUpdate ? undefined : 0);

  if (resolvedMarksObtained !== undefined && resolvedMarksObtained > resolvedMaxMarks) {
    throw new AppError('marks_obtained cannot exceed max_marks', 400);
  }

  const userRole = String(user?.role || '').toLowerCase();
  const resolvedTeacherId = teacherId || user?.id;

  return {
    student_id: studentId,
    teacher_id: userRole === 'admin' || userRole === 'principal' ? resolvedTeacherId : user?.id,
    class_id: classId,
    exam_id: examId,
    subject_id: subjectId,
    marks_obtained: resolvedMarksObtained,
    max_marks: resolvedMaxMarks,
    passing_marks: resolvedPassingMarks,
    status: deriveStatus(resolvedMarksObtained, resolvedPassingMarks),
  };
};

const createResult = async (data, user) => {
  const resultPayload = normalizeResultPayload(data, user, { isUpdate: false });
  return resultRepository.create(resultPayload);
};

const updateResult = async (id, data) => {
  const existingResult = await resultRepository.findById(id);
  if (!existingResult) {
    throw new AppError('Result not found', 404);
  }

  const updates = {};
  const normalizedPayload = normalizeResultPayload(data, {}, { isUpdate: true });

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
    return existingResult;
  }

  return resultRepository.update(id, updates);
};

const getResultById = async (id) => {
  const result = await resultRepository.findById(id);
  if (!result) {
    throw new AppError('Result not found', 404);
  }
  return result;
};

const getAllResults = async (user) => {
  const role = String(user.role).toLowerCase();
  const allResults = await resultRepository.findAll();

  if (role === 'admin' || role === 'principal') {
    return allResults;
  }

  if (role === 'teacher') {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id);
    return allResults.filter((result) => {
      const teacherIdMatches = String(result.teacher_id || result.teacherId) === String(user.id);
      const classMatches = teacherClassIds.includes(String(result.class_id || result.classId));
      return teacherIdMatches || classMatches;
    });
  }

  if (role === 'parent') {
    const parentStudentIds = await relationshipService.getParentStudentIds(user.id);
    return allResults.filter((result) => parentStudentIds.includes(String(result.student_id || result.studentId)));
  }

  if (role === 'student') {
    throw new AppError('Students are not allowed to view all results', 403);
  }

  return [];
};

const getMyResults = async (user) => {
  const allResults = await resultRepository.findAll();
  return allResults.filter((result) => String(result.student_id || result.studentId) === String(user.id));
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
