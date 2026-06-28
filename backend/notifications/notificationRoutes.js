const express = require('express');
const controller = require('./notificationController');

const router = express.Router();

router.post('/', controller.createNotification);
router.post('/send', controller.createAndSendNotification);
router.post('/:id/send', controller.sendNotification);

router.get('/history', controller.notificationHistory);
router.get('/me', controller.myNotifications);

router.patch('/announcements/:id', controller.updateAnnouncement);
router.delete('/announcements/:id', controller.deleteAnnouncement);

module.exports = router;
