const { getClientForUser } = require('../services/database.service');
const { validateAttendanceDate, validateAttendanceStatus } = require('./validation');

const markAttendance = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader && authHeader.split(' ')[1];
        const supabase = getClientForUser(token);

        const role = req.user.role; 
        const normalizedRole = role ? role.toLowerCase() : '';

        if (normalizedRole !== 'admin' && normalizedRole !== 'teacher' && normalizedRole !== 'principal') {
            return res.status(403).json({ 
                error: "Access denied. Only authorized staff can mark attendance." 
            });
        }

        const { date, studentId, status, classId } = req.body;

        const dateCheck = validateAttendanceDate(date);
        if (!dateCheck.valid) {
            return res.status(400).json({ error: dateCheck.message });
        }

        const statusCheck = validateAttendanceStatus(status);
        if (!statusCheck.valid) {
            return res.status(400).json({ error: statusCheck.message });
        }

        const { data, error } = await supabase
            .from('attendance_records')
            .insert([
                { 
                    date, 
                    student_id: studentId, 
                    status, 
                    class_id: classId 
                }
            ])
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Attendance already marked for this student on this date." });
            }
            throw error;
        }

        return res.status(201).json({ 
            message: "Attendance marked successfully.",
            data: data[0]
        });
    } catch (error) {
        console.error("Error in markAttendance:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader && authHeader.split(' ')[1];
        const supabase = getClientForUser(token);

        const role = req.user.role;
        const normalizedRole = role ? role.toLowerCase() : '';

        if (normalizedRole !== 'admin' && normalizedRole !== 'teacher' && normalizedRole !== 'principal') {
            return res.status(403).json({ 
                error: "Access denied. Only authorized staff can update attendance records." 
            });
        }

        const { id } = req.params; 
        const { date, status } = req.body;

        const dateCheck = validateAttendanceDate(date);
        if (!dateCheck.valid) {
            return res.status(400).json({ error: dateCheck.message });
        }

        const statusCheck = validateAttendanceStatus(status);
        if (!statusCheck.valid) {
            return res.status(400).json({ error: statusCheck.message });
        }

        const { data, error } = await supabase
            .from('attendance_records')
            .update({ date, status })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Attendance record not found." });
        }

        return res.status(200).json({ 
            message: "Attendance records updated successfully.",
            data: data[0] 
        });
    } catch (error) {
        console.error("Error in updateAttendance:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const viewAttendance = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader && authHeader.split(' ')[1];
        const supabase = getClientForUser(token);

        const userId = req.user.id;
        const role = req.user.role;
        const normalizedRole = role ? role.toLowerCase() : '';
        
        const { classId, date } = req.query; 
        let query = supabase.from('attendance_records').select('*');

        if (normalizedRole === 'student') {
            console.log(`Enforcing structural query isolation. Filtering target student_id: ${userId}`);
            query = query.eq('student_id', userId);
        } else {
            console.log(`Role '${role}' authorized to request cross-sectional attendance logs.`);
            if (classId) query = query.eq('class_id', classId);
            if (date) query = query.eq('date', date);
        }

        const { data, error } = await query;

        if (error) throw error;

        return res.status(200).json({ 
            message: normalizedRole === 'student' ? "Displaying your personal attendance records securely." : "Displaying requested multi-user attendance records.",
            scope: normalizedRole === 'student' ? "Individual" : "Administrative",
            data: data
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