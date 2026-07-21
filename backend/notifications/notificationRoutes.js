const express = require('express');
const { authenticateToken } = require('../auth/middleware/auth.middleware');
const controller = require('./notificationController');

const { authorizeRoles } = require('../auth/middleware/role.middleware');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), controller.createNotification);
router.post('/send', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), controller.createAndSendNotification);
router.post('/:id/send', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), controller.sendNotification);

router.get('/history', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), controller.notificationHistory);
router.get('/me', authenticateToken, authorizeRoles('admin', 'teacher', 'principal', 'student', 'parent'), controller.myNotifications);

router.patch('/announcements/:id', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), controller.updateAnnouncement);
router.delete('/announcements/:id', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), controller.deleteAnnouncement);

module.exports = router;