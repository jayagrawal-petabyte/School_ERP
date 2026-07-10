const express = require('express');
const router = express.Router();
const { markAttendance, updateAttendance, viewAttendance } = require('./attendanceController');

const { authenticateToken } = require('../auth/middleware/auth.middleware'); 
const { authorizeRoles } = require('../auth/middleware/role.middleware'); 

router.post('/mark', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), markAttendance);
router.put('/update/:id', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), updateAttendance);
router.get('/view', authenticateToken, viewAttendance);

module.exports = router;