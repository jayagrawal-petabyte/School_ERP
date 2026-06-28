const store = require('./assignmentStore');

const staffRoles = ['admin', 'teacher'];

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function readUser(req) {
  return req.user || req.currentUser || {};
}

function requireTeacherOrAdmin(user) {
  const role = String(user.role || '').toLowerCase();

  if (!staffRoles.includes(role)) {
    const error = new Error(
      'Only admins and teachers can manage assignments.'
    );
    error.statusCode = 403;
    throw error;
  }
}

function validateAssignment(payload) {
  const title = cleanText(payload.title);
  const description = cleanText(payload.description);
  const subject = cleanText(payload.subject);
  const className = cleanText(payload.className);
  const dueDate = String(payload.dueDate || '').trim();

  if (!title) {
    const error = new Error('Assignment title is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!description) {
    const error = new Error('Assignment description is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!subject) {
    const error = new Error('Subject is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!className) {
    const error = new Error('Class name is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!dueDate) {
    const error = new Error('Due date is required.');
    error.statusCode = 400;
    throw error;
  }

  const due = new Date(dueDate);

  if (Number.isNaN(due.getTime())) {
    const error = new Error('Invalid due date.');
    error.statusCode = 400;
    throw error;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due < today) {
    const error = new Error('Due date cannot be in the past.');
    error.statusCode = 400;
    throw error;
  }

  return {
    title,
    description,
    subject,
    className,
    dueDate,
  };
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
    const error = new Error('Assignment not found.');
    error.statusCode = 404;
    throw error;
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
    const error = new Error('Assignment not found.');
    error.statusCode = 404;
    throw error;
  }

  return store.removeAssignment(id);
}

function listAssignments(user) {
  return store.listAssignments();
}

function getAssignment(id) {
  const assignment = store.findAssignment(id);

  if (!assignment) {
    const error = new Error('Assignment not found.');
    error.statusCode = 404;
    throw error;
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