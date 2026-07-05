const express = require('express');
const router = express.Router();
const { markAttendance, updateAttendance, viewAttendance } = require('./attendanceController');

router.post('/mark', markAttendance);
router.put('/update/:id', updateAttendance);
router.get('/view', viewAttendance);

module.exports = router;