const express = require('express');
const { authenticateToken } = require('../auth/middleware/auth.middleware');
const controller = require('./notificationController');

const router = express.Router();

function requireStaffRole(req, res, next) {
  const role = String((req.user || {}).role || '').toLowerCase();
  if (role !== 'admin' && role !== 'teacher' && role !== 'principal') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  next();
}

router.post('/', authenticateToken, controller.createNotification);
router.post('/send', authenticateToken, controller.createAndSendNotification);
router.post('/:id/send', authenticateToken, controller.sendNotification);

router.get('/history', authenticateToken, requireStaffRole, controller.notificationHistory);
router.get('/me', authenticateToken, controller.myNotifications);

router.patch('/announcements/:id', authenticateToken, requireStaffRole, controller.updateAnnouncement);
router.delete('/announcements/:id', authenticateToken, controller.deleteAnnouncement);

module.exports = router;