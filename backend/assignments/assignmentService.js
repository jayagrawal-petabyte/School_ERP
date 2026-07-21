const store = require('./assignmentStore');
const { validateAssignment } = require('./validation');

const staffRoles = ['admin', 'teacher'];

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function readUser(req) {
  return req.user || req.currentUser || {};
}

function requireTeacherOrAdmin(user) {
  const role = String(user.role || '').toLowerCase();

  if (!staffRoles.includes(role)) {
    throw createError(
      403,
      'Only admins and teachers can manage assignments.'
    );
  }
}

async function createAssignment(payload, user) {
  requireTeacherOrAdmin(user);

  const assignment = validateAssignment(payload);

  return await store.addAssignment(user.token, {
    ...assignment,
    createdBy: String(user.id || user._id || user.email || 'unknown'),
  });
}

async function updateAssignment(id, payload, user) {
  requireTeacherOrAdmin(user);

  const existing = await store.findAssignment(user.token, id);

  if (!existing) {
    throw createError(404, 'Assignment not found.');
  }

  const updated = validateAssignment({
    ...existing,
    ...payload,
  });

  return await store.updateAssignment(user.token, id, updated);
}

async function deleteAssignment(id, user) {
  requireTeacherOrAdmin(user);

  const assignment = await store.findAssignment(user.token, id);

  if (!assignment) {
    throw createError(404, 'Assignment not found.');
  }

  return await store.removeAssignment(user.token, id);
}

async function listAssignments(user) {
  const role = String(user.role || '').toLowerCase();
  let filters = {};

  if (role === 'student') {
    const studentId = user.id || user._id;
    const allowedClassIds = await store.getStudentClassIds(user.token, studentId);
    filters.classIds = allowedClassIds;
  }

  return await store.listAssignments(user.token, filters);
}

async function getAssignment(id, user) {
  const assignment = await store.findAssignment(user.token, id);

  if (!assignment) {
    throw createError(404, 'Assignment not found.');
  }

  const role = String(user.role || '').toLowerCase();
  if (role === 'student') {
    const studentId = user.id || user._id;
    const allowedClassIds = await store.getStudentClassIds(user.token, studentId);
    if (!assignment.classId || !allowedClassIds.includes(assignment.classId)) {
      throw createError(403, 'Access denied. You are not enrolled in the class for this assignment.');
    }
  }

  return assignment;
}

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listAssignments,
  getAssignment,
  readUser,
};