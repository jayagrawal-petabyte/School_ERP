const store = require('./userStore');

const adminRoles = ['admin', 'principal'];
const validRoles = ['admin', 'principal', 'teacher', 'student', 'parent'];

const sensitiveFields = [
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'refreshToken',
  'refresh_token',
  'failedLoginAttempts',
  'failed_login_attempts',
  'accountLockedUntil',
  'account_locked_until',
];


const namePattern = /^[\p{L}\s.\-']+$/u;

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function readUser(req) {
  return req.user || req.currentUser || {};
}


function sanitizeUser(user) {
  if (!user) {
    return user;
  }

  const clean = { ...user };

  for (const field of sensitiveFields) {
    delete clean[field];
  }

  return clean;
}

function sanitizeUsers(users) {
  return users.map(sanitizeUser);
}

function requireAdminOrPrincipal(user) {
  const role = String(user.role || '').toLowerCase();

  if (!adminRoles.includes(role)) {
    const error = new Error('Only admins and principals can manage users.');
    error.statusCode = 403;
    throw error;
  }
}

function validateName(name) {
  if (!name) {
    const error = new Error('Full name is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!namePattern.test(name)) {
    const error = new Error(
      'Full name can only contain letters, spaces, hyphens, apostrophes, and periods.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (name.length < 2 || name.length > 100) {
    const error = new Error('Full name must be between 2 and 100 characters.');
    error.statusCode = 400;
    throw error;
  }
}

function validateUser(payload) {
  const fullName = cleanText(payload.fullName);
  const email = cleanText(payload.email);
  const role = payload.role ? String(payload.role).toLowerCase().trim() : '';

  validateName(fullName);

  if (!email) {
    const error = new Error('Email is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('Invalid email format.');
    error.statusCode = 400;
    throw error;
  }

  if (!role) {
    const error = new Error('Role is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!validRoles.includes(role)) {
    const error = new Error(
      'Role must be one of: admin, principal, teacher, student, parent.'
    );
    error.statusCode = 400;
    throw error;
  }

  return { fullName, email, role };
}

function createUser(payload, currentUser) {
  requireAdminOrPrincipal(currentUser);

  const validated = validateUser(payload);

  const existing = store.findUserByEmail(validated.email);

  if (existing) {
    const error = new Error('A user with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = store.addUser({
    ...validated,
    createdBy: String(
      currentUser.id || currentUser._id || currentUser.email || 'unknown'
    ),
  });

  return sanitizeUser(user);
}

function updateUser(id, payload, currentUser) {
  requireAdminOrPrincipal(currentUser);

  const existing = store.findUser(id);

  if (!existing) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const fullName = cleanText(payload.fullName || existing.fullName);
  const email = cleanText(payload.email || existing.email);

  validateName(fullName);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('Invalid email format.');
    error.statusCode = 400;
    throw error;
  }

  if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
    const duplicate = store.findUserByEmail(email);

    if (duplicate) {
      const error = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }
  }

  const user = store.updateUser(id, { fullName, email });
  return sanitizeUser(user);
}

function deleteUser(id, currentUser) {
  requireAdminOrPrincipal(currentUser);

  const existing = store.findUser(id);

  if (!existing) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const removed = store.removeUser(id);
  return sanitizeUser(removed);
}

function getUserById(id) {
  const user = store.findUser(id);

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
}

function listUsers(filters) {
  const users = store.listUsers(filters);
  return sanitizeUsers(users);
}

function toggleStatus(id, currentUser) {
  requireAdminOrPrincipal(currentUser);

  const existing = store.findUser(id);

  if (!existing) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const newStatus =
    existing.accountStatus === 'active' ? 'inactive' : 'active';

  const user = store.updateUser(id, { accountStatus: newStatus });
  return sanitizeUser(user);
}

module.exports = {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  readUser,
  requireAdminOrPrincipal,
  sanitizeUser,
  sanitizeUsers,
  toggleStatus,
  updateUser,
};
