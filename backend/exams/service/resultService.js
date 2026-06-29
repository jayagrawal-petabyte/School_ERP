const AppError = require('../errors/AppError');
const resultRepository = require('../repository/resultRepository');
const relationshipService = require('./relationshipService');

const validateMarksValue = (marks, isRequired = true) => {
  if (marks === undefined || marks === null || marks === '') {
    if (isRequired) {
      throw new AppError('Marks are required', 400);
    }
    return undefined;
  }

  const marksNum = Number(marks);
  if (isNaN(marksNum) || typeof marks === 'boolean') {
    throw new AppError('Marks must be a number', 400);
  }

  if (marksNum < 0 || marksNum > 100) {
    throw new AppError('Marks must be between 0 and 100 inclusive', 400);
  }

  return marksNum;
};

const createResult = async (data, user) => {
  const marks = validateMarksValue(data.marks, true);

  if (!data.studentId) {
    throw new AppError('Student ID is required', 400);
  }

  if (!data.subject) {
    throw new AppError('Subject is required', 400);
  }

  if (!data.examType) {
    throw new AppError('Exam type is required', 400);
  }

  const userRole = String(user.role).toLowerCase();
  const teacherId = userRole === 'admin' || userRole === 'principal'
    ? data.teacherId || user.id
    : user.id;

  const resultPayload = {
    studentId: data.studentId,
    subject: data.subject,
    examType: data.examType,
    marks,
    teacherId,
  };

  return resultRepository.create(resultPayload);
};

const updateResult = async (id, data) => {
  const existingResult = await resultRepository.findById(id);
  if (!existingResult) {
    throw new AppError('Result not found', 404);
  }

  const updates = {};
  if (data.marks !== undefined) {
    updates.marks = validateMarksValue(data.marks, false);
  }
  if (data.subject !== undefined) {
    updates.subject = data.subject;
  }
  if (data.examType !== undefined) {
    updates.examType = data.examType;
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
    return allResults.filter((result) => String(result.teacherId) === String(user.id));
  }

  if (role === 'parent') {
    const parentStudentIds = await relationshipService.getParentStudentIds(user.id);
    return allResults.filter((result) => parentStudentIds.includes(String(result.studentId)));
  }

  if (role === 'student') {
    throw new AppError('Students are not allowed to view all results', 403);
  }

  return [];
};

const getMyResults = async (user) => {
  const allResults = await resultRepository.findAll();
  return allResults.filter((result) => String(result.studentId) === String(user.id));
};

const getOwnershipContext = async (id) => {
  const result = await resultRepository.findById(id);
  if (!result) {
    return null;
  }

  return {
    studentId: result.studentId,
    teacherId: result.teacherId,
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
