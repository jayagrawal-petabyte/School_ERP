const express = require('express');
const router = express.Router();
const { markAttendance, updateAttendance, viewAttendance } = require('./attendanceController');

const verifyJWT = (req, res, next) => next(); 

router.post('/mark', verifyJWT, markAttendance);
router.put('/update', verifyJWT, updateAttendance);
router.get('/view', verifyJWT, viewAttendance);

module.exports = router;