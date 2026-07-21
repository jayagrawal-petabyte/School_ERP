const express = require('express');
const router = express.Router();
const { 
    markAttendance, 
    updateAttendance, 
    viewAttendance, 
    getTeacherClasses, 
    getStudentsByClass 
} = require('./attendanceController');

const { authenticateToken } = require('../auth/middleware/auth.middleware'); 
const { authorizeRoles } = require('../auth/middleware/role.middleware'); 

router.post('/mark', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), markAttendance);
router.put('/update/:id', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), updateAttendance);
router.get('/view', authenticateToken, authorizeRoles('admin', 'teacher', 'principal', 'student', 'parent'), viewAttendance);

router.get('/classes', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), getTeacherClasses);
router.get('/students', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), getStudentsByClass);

module.exports = router;