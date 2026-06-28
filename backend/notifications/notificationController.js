const service = require('./notificationService');

function sendResponse(res, statusCode, data) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function handleError(res, error) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Something went wrong.',
  });
}

function createNotification(req, res) {
  try {
    const user = service.readUser(req);
    const notification = service.createNotification(req.body, user);

    return sendResponse(res, 201, notification);
  } catch (error) {
    return handleError(res, error);
  }
}

function sendNotification(req, res) {
  try {
    const user = service.readUser(req);
    const notification = service.sendNotification(req.params.id, user);

    return sendResponse(res, 200, notification);
  } catch (error) {
    return handleError(res, error);
  }
}

function createAndSendNotification(req, res) {
  try {
    const user = service.readUser(req);
    const notification = service.createAndSendNotification(req.body, user);

    return sendResponse(res, 201, notification);
  } catch (error) {
    return handleError(res, error);
  }
}

function notificationHistory(req, res) {
  try {
    const history = service.notificationHistory(req.query);

    return sendResponse(res, 200, history);
  } catch (error) {
    return handleError(res, error);
  }
}

function myNotifications(req, res) {
  try {
    const user = service.readUser(req);
    const notifications = service.notificationsForUser(user);

    return sendResponse(res, 200, notifications);
  } catch (error) {
    return handleError(res, error);
  }
}

function updateAnnouncement(req, res) {
  try {
    const user = service.readUser(req);
    const announcement = service.updateAnnouncement(req.params.id, req.body, user);

    return sendResponse(res, 200, announcement);
  } catch (error) {
    return handleError(res, error);
  }
}

function deleteAnnouncement(req, res) {
  try {
    const user = service.readUser(req);
    const announcement = service.deleteAnnouncement(req.params.id, user);

    return sendResponse(res, 200, announcement);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createAndSendNotification,
  createNotification,
  deleteAnnouncement,
  myNotifications,
  notificationHistory,
  sendNotification,
  updateAnnouncement,
};
