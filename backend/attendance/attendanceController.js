const supabase = require('../database/supabaseClient'); // Adjust path if their client file has a different name
const { validateAttendanceDate, validateAttendanceStatus } = require('./validation');

const markAttendance = async (req, res) => {
    try {
        const { role, user_id } = req.user; 
        const { date, studentId, status, classId } = req.body;

        if (role !== 'admin' && role !== 'teacher') {
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
        const { role } = req.user;
        const { id } = req.params; // Expecting the attendance record ID in the URL params
        const { date, status } = req.body;

        if (role !== 'admin' && role !== 'teacher') {
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
        const { role, user_id } = req.user;
        const { classId, date } = req.query; // Query filters
        
        let query = supabase.from('attendance_records').select('*');

        if (role === 'student') {
            console.log(`Enforcing structural query isolation. Filtering target student_id: ${user_id}`);
            query = query.eq('student_id', user_id);
        } else {
            console.log(`Role '${role}' authorized to request cross-sectional attendance logs.`);
            if (classId) query = query.eq('class_id', classId);
            if (date) query = query.eq('date', date);
        }

        const { data, error } = await query;

        if (error) throw error;

        return res.status(200).json({ 
            message: role === 'student' ? "Displaying your personal attendance records securely." : "Displaying requested multi-user attendance records.",
            scope: role === 'student' ? "Individual" : "Administrative",
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