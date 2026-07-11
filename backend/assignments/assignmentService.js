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

async function createAssignment(token, payload, user) {
  requireTeacherOrAdmin(user);

  const assignment = validateAssignment(payload);

  return await store.addAssignment(token, {
    ...assignment,
    createdBy: String(user.id || user._id || user.email || 'unknown'),
  });
}

async function updateAssignment(token, id, payload, user) {
  requireTeacherOrAdmin(user);

  const existing = await store.findAssignment(token, id);

  if (!existing) {
    throw createError(404, 'Assignment not found.');
  }

  const updated = validateAssignment({
    ...existing,
    ...payload,
  });

  return await store.updateAssignment(token, id, updated);
}

async function deleteAssignment(token, id, user) {
  requireTeacherOrAdmin(user);

  const assignment = await store.findAssignment(token, id);

  if (!assignment) {
    throw createError(404, 'Assignment not found.');
  }

  return await store.removeAssignment(token, id);
}

async function listAssignments(token, user) {
  // Reserved for future role/class-based filtering
  return await store.listAssignments(token);
}

async function getAssignment(token, id) {
  const assignment = await store.findAssignment(token, id);

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