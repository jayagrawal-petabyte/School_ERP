const store = require('./notificationStore');

const staffRoles = ['admin', 'teacher'];
const allowedAudienceRoles = ['student', 'teacher', 'parent'];
const allowedTypes = ['notification', 'announcement'];

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function hasHtmlTag(value) {
  return /<[^>]+>/i.test(String(value || ''));
}

function readUser(req) {
  return req.user || req.currentUser || {};
}

function requireStaff(user) {
  const role = String(user.role || '').toLowerCase();

  if (!staffRoles.includes(role)) {
    const error = new Error('Only admins and teachers can create or send notifications.');
    error.statusCode = 403;
    throw error;
  }
}

function buildAudience(input = {}) {
  const roles = Array.isArray(input.roles) ? input.roles : [];
  const userIds = Array.isArray(input.userIds) ? input.userIds : [];

  const cleanedRoles = roles
    .map((role) => String(role).toLowerCase().trim())
    .filter(Boolean);

  const invalidRole = cleanedRoles.find((role) => !allowedAudienceRoles.includes(role));

  if (invalidRole) {
    const error = new Error('Audience can include only student, teacher, or parent.');
    error.statusCode = 400;
    throw error;
  }

  if (cleanedRoles.length === 0 && userIds.length === 0) {
    const error = new Error('Select at least one audience role or user id.');
    error.statusCode = 400;
    throw error;
  }

  return {
    roles: [...new Set(cleanedRoles)],
    userIds: [...new Set(userIds.map((id) => String(id).trim()).filter(Boolean))],
  };
}

function validatePayload(payload) {
  const title = cleanText(payload.title);
  const message = cleanText(payload.message);
  const type = payload.type ? String(payload.type).toLowerCase().trim() : 'notification';

  if (!title) {
    const error = new Error('Notification title is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!message) {
    const error = new Error('Notification message is required.');
    error.statusCode = 400;
    throw error;
  }

  if (hasHtmlTag(message)) {
    const error = new Error('Message body cannot contain HTML or script tags.');
    error.statusCode = 400;
    throw error;
  }

  if (!allowedTypes.includes(type)) {
    const error = new Error('Notification type must be notification or announcement.');
    error.statusCode = 400;
    throw error;
  }

  return {
    title,
    message,
    type,
    audience: buildAudience(payload.audience),
  };
}

function createNotification(payload, user) {
  requireStaff(user);

  const notification = validatePayload(payload);

  return store.addNotification({
    ...notification,
    createdBy: String(user.id || user._id || user.email || 'unknown'),
  });
}

function sendNotification(id, user) {
  requireStaff(user);

  const notification = store.findNotification(id);

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    throw error;
  }

  if (notification.status === 'sent') {
    const error = new Error('Notification is already sent.');
    error.statusCode = 409;
    throw error;
  }

  return store.updateNotification(id, {
    status: 'sent',
    sentAt: new Date().toISOString(),
  });
}

function createAndSendNotification(payload, user) {
  const notification = createNotification(payload, user);
  return sendNotification(notification.id, user);
}

function updateAnnouncement(id, payload, user) {
  requireStaff(user);

  const existing = store.findNotification(id);

  if (!existing || existing.type !== 'announcement') {
    const error = new Error('Announcement not found.');
    error.statusCode = 404;
    throw error;
  }

  if (existing.status === 'sent') {
    const error = new Error('Sent announcements cannot be edited.');
    error.statusCode = 409;
    throw error;
  }

  const updated = validatePayload({
    ...existing,
    ...payload,
    type: 'announcement',
  });

  return store.updateNotification(id, updated);
}

function deleteAnnouncement(id, user) {
  requireStaff(user);

  const existing = store.findNotification(id);

  if (!existing || existing.type !== 'announcement') {
    const error = new Error('Announcement not found.');
    error.statusCode = 404;
    throw error;
  }

  return store.removeNotification(id);
}

function notificationHistory(query = {}) {
  return store.listNotifications({
    status: query.status,
    type: query.type,
  });
}

function notificationsForUser(user) {
  const role = String(user.role || '').toLowerCase();

  if (!allowedAudienceRoles.includes(role)) {
    return [];
  }

  return store.listNotifications({
    status: 'sent',
    role,
    userId: user.id || user._id,
  });
}

module.exports = {
  createAndSendNotification,
  createNotification,
  deleteAnnouncement,
  notificationHistory,
  notificationsForUser,
  readUser,
  sendNotification,
  updateAnnouncement,
};
