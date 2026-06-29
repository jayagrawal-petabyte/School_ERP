const AppError = require('../errors/AppError');

const isParentOfStudent = async (parentId, studentId) => {
  if (!parentId || !studentId) {
    throw new AppError('Invalid parent/student identifiers', 400);
  }

  // TODO: Replace with actual parent-student lookup once user management integration is available.
  return false;
};

const getParentStudentIds = async (parentId) => {
  if (!parentId) {
    throw new AppError('Invalid parent identifier', 400);
  }

  return [];
};

module.exports = {
  isParentOfStudent,
  getParentStudentIds,
};
