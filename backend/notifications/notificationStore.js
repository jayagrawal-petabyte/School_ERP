const notifications = [];

let nextId = 1;

function now() {
  return new Date().toISOString();
}

function addNotification(data) {
  const notification = {
    id: String(nextId++),
    title: data.title,
    message: data.message,
    audience: data.audience,
    type: data.type || 'notification',
    status: data.status || 'draft',
    createdBy: data.createdBy,
    createdAt: now(),
    sentAt: null,
  };

  notifications.push(notification);
  return notification;
}

function findNotification(id) {
  return notifications.find((item) => item.id === String(id));
}

function updateNotification(id, changes) {
  const notification = findNotification(id);

  if (!notification) {
    return null;
  }

  Object.assign(notification, changes);
  return notification;
}

function removeNotification(id) {
  const index = notifications.findIndex((item) => item.id === String(id));

  if (index === -1) {
    return null;
  }

  const [removed] = notifications.splice(index, 1);
  return removed;
}

function listNotifications(filters = {}) {
  return notifications.filter((item) => {
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    if (filters.type && item.type !== filters.type) {
      return false;
    }

    if (filters.role || filters.userId) {
      const roleMatch = filters.role && item.audience.roles.includes(filters.role);
      const userMatch = filters.userId && item.audience.userIds.includes(String(filters.userId));

      return Boolean(roleMatch || userMatch);
    }

    return true;
  });
}

module.exports = {
  addNotification,
  findNotification,
  listNotifications,
  removeNotification,
  updateNotification,
};
