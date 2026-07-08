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

function createAssignment(payload, user) {
  requireTeacherOrAdmin(user);

  const assignment = validateAssignment(payload);

  return store.addAssignment({
    ...assignment,
    createdBy: String(user.id || user._id || user.email || 'unknown'),
  });
}

function updateAssignment(id, payload, user) {
  requireTeacherOrAdmin(user);

  const existing = store.findAssignment(id);

  if (!existing) {
    throw createError(404, 'Assignment not found.');
  }

  const updated = validateAssignment({
    ...existing,
    ...payload,
  });

  return store.updateAssignment(id, updated);
}

function deleteAssignment(id, user) {
  requireTeacherOrAdmin(user);

  const assignment = store.findAssignment(id);

  if (!assignment) {
    throw createError(404, 'Assignment not found.');
  }

  return store.removeAssignment(id);
}

function listAssignments(user) {
  // Reserved for future role/class-based filtering
  return store.listAssignments();
}

function getAssignment(id) {
  const assignment = store.findAssignment(id);

  if (!assignment) {
    throw createError(404, 'Assignment not found.');
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