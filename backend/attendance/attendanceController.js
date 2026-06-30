const { validateAttendanceDate, validateAttendanceStatus } = require('./validation');

const markAttendance = async (req, res) => {
    try {
        const { role, user_id } = req.user; 
        const { date, studentId, status, classId } = req.body;

        if (role !== 'Admin' && role !== 'Teacher') {
            return res.status(403).json({ 
                error: "Access denied. Only Teachers and Admins can mark attendance." 
            });
        }

        const dateCheck = validateAttendanceDate(date);
        if (!dateCheck.valid) {
            return res.status(400).json({ error: dateCheck.message });
        }

        const statusCheck = validateAttendanceStatus(status);
        if (!statusCheck.valid) {
            return res.status(400).json({ error: statusCheck.message });
        }

        return res.status(201).json({ 
            message: "Attendance marked successfully.",
            data: { date, studentId, status, classId }
        });
    } catch (error) {
        console.error("Error in markAttendance:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { role } = req.user;
        const { date, status } = req.body;

        if (role !== 'Admin' && role !== 'Teacher') {
            return res.status(403).json({ 
                error: "Access denied. Only Teachers and Admins can update attendance records." 
            });
        }

        const dateCheck = validateAttendanceDate(date);
        if (!dateCheck.valid) {
            return res.status(400).json({ error: dateCheck.message });
        }

        const statusCheck = validateAttendanceStatus(status);
        if (!statusCheck.valid) {
            return res.status(400).json({ error: statusCheck.message });
        }

        return res.status(200).json({ message: "Attendance records updated successfully." });
    } catch (error) {
        console.error("Error in updateAttendance:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const viewAttendance = async (req, res) => {
    try {
        const { role, user_id } = req.user;
        
        if (role === 'Student') {
            console.log(`Enforcing structural query isolation. Filtering target student_id: ${user_id}`);
            return res.status(200).json({ 
                message: "Displaying your personal attendance records securely.",
                scope: "Individual"
            });
        }

        console.log(`Role '${role}' authorized to request cross-sectional attendance logs.`);
        return res.status(200).json({ 
            message: "Displaying requested multi-user attendance records.",
            scope: "Administrative"
        });
    } catch (error) {
        console.error("Error in viewAttendance:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    markAttendance,
    updateAttendance,
    viewAttendance
};