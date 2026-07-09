const express = require('express');
const router = express.Router();
const { markAttendance, updateAttendance, viewAttendance } = require('./attendanceController');

const { authenticateToken } = require('../auth/middleware/auth.middleware'); 

router.post('/mark', authenticateToken, markAttendance);
router.put('/update/:id', authenticateToken, updateAttendance);
router.get('/view', authenticateToken, viewAttendance);

module.exports = router;