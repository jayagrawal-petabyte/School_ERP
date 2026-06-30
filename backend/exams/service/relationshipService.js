const AppError = require('../errors/AppError');

const isParentOfStudent = async (parentId, studentId) => {
  if (!parentId || !studentId) {
    throw new AppError('Invalid parent/student identifiers', 400);
  }

  // TODO: Replace with actual parent-student lookup once the user management integration is available.
  return false;
};

const getParentStudentIds = async (parentId) => {
  if (!parentId) {
    throw new AppError('Invalid parent identifier', 400);
  }

  return [];
};

const getTeacherClassIds = async (teacherId) => {
  if (!teacherId) {
    throw new AppError('Invalid teacher identifier', 400);
  }

  return [];
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
