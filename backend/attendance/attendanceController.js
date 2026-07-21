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
            query = query.eq('student_id', userId);
        } else if (normalizedRole === 'parent') {
            const { data: linkedStudents, error: linkError } = await supabase
                .from('parent_students')
                .select('student_id')
                .eq('parent_id', userId);
            if (linkError) throw linkError;
            const studentIds = (linkedStudents || []).map(r => r.student_id);
            if (studentIds.length === 0) {
                return res.status(200).json({ message: "No linked students found.", scope: "Parent", data: [] });
            }
            query = query.in('student_id', studentIds);
            if (date) query = query.eq('date', date);
        } else {
            if (classId) query = query.eq('class_id', classId);
            if (date) query = query.eq('date', date);
        }

        const { data, error } = await query;

        if (error) throw error;

        return res.status(200).json({ 
            message: normalizedRole === 'student' ? "Displaying your personal attendance records securely." : normalizedRole === 'parent' ? "Displaying linked student attendance records." : "Displaying requested multi-user attendance records.",
            scope: normalizedRole === 'student' ? "Individual" : normalizedRole === 'parent' ? "Parent" : "Administrative",
            data: data
        });
    } catch (error) {
        console.error("Error in viewAttendance:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const getTeacherClasses = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader && authHeader.split(' ')[1];
        const supabase = getClientForUser(token);
        
        const teacherId = req.user.id;

        const { data, error } = await supabase
            .from('class_teachers')
            .select(`
                class_id,
                classes (
                    id,
                    class_name,
                    section
                )
            `)
            .eq('teacher_id', teacherId);

        if (error) throw error;

        const formattedClasses = data.map(item => item.classes).filter(Boolean);
        return res.status(200).json({ success: true, data: formattedClasses });
    } catch (error) {
        console.error("Error in getTeacherClasses:", error);
        return res.status(500).json({ success: false, error: "Internal server error." });
    }
};

const getStudentsByClass = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader && authHeader.split(' ')[1];
        const supabase = getClientForUser(token);
        
        const { classId } = req.query;
        if (!classId) {
            return res.status(400).json({ error: "classId parameter is required." });
        }

        const { data: attendanceRows, error: attendanceError } = await supabase
            .from('attendance_records')
            .select('student_id')
            .eq('class_id', classId);

        if (attendanceError) throw attendanceError;

        const studentIds = [...new Set((attendanceRows || []).map(r => r.student_id))];

        if (studentIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, role')
            .in('id', studentIds)
            .eq('role', 'student');

        if (error) throw error;

        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error("Error in getStudentsByClass:", error);
        return res.status(500).json({ success: false, error: "Internal server error." });
    }
};

const getRecentAttendance = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader && authHeader.split(' ')[1];
        const supabase = getClientForUser(token);

        const userId = req.user.id;
        const role = req.user.role;
        const normalizedRole = role ? role.toLowerCase() : '';
        const limit = parseInt(req.query.limit) || 10;

        let query = supabase
            .from('attendance_records')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);

        if (normalizedRole === 'student') {
            query = query.eq('student_id', userId);
        } else if (normalizedRole === 'parent') {
            const { data: linkedStudents, error: linkError } = await supabase
                .from('parent_students')
                .select('student_id')
                .eq('parent_id', userId);
            if (linkError) throw linkError;
            const studentIds = (linkedStudents || []).map(r => r.student_id);
            if (studentIds.length === 0) {
                return res.status(200).json({ message: "No linked students found.", scope: "Parent", data: [] });
            }
            query = query.in('student_id', studentIds);
        } else {
            const { classId } = req.query;
            if (classId) query = query.eq('class_id', classId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return res.status(200).json({ data });
    } catch (error) {
        console.error("Error in getRecentAttendance:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const getAttendanceSummary = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader && authHeader.split(' ')[1];
        const supabase = getClientForUser(token);

        const userId = req.user.id;
        const role = req.user.role;
        const normalizedRole = role ? role.toLowerCase() : '';
        const { classId, date } = req.query;

        let query = supabase.from('attendance_records').select('status');

        if (normalizedRole === 'student') {
            query = query.eq('student_id', userId);
        } else if (normalizedRole === 'parent') {
            const { data: linkedStudents, error: linkError } = await supabase
                .from('parent_students')
                .select('student_id')
                .eq('parent_id', userId);
            if (linkError) throw linkError;
            const studentIds = (linkedStudents || []).map(r => r.student_id);
            if (studentIds.length === 0) {
                return res.status(200).json({ message: "No linked students found.", scope: "Parent", data: {} });
            }
            query = query.in('student_id', studentIds);
            if (date) query = query.eq('date', date);
        } else {
            if (classId) query = query.eq('class_id', classId);
            if (date) query = query.eq('date', date);
        }

        const { data, error } = await query;
        if (error) throw error;

        const summary = (data || []).reduce((acc, row) => {
            acc[row.status] = (acc[row.status] || 0) + 1;
            return acc;
        }, {});

        return res.status(200).json({ data: summary });
    } catch (error) {
        console.error("Error in getAttendanceSummary:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const getAttendanceCalendar = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader && authHeader.split(' ')[1];
        const supabase = getClientForUser(token);

        const userId = req.user.id;
        const role = req.user.role;
        const normalizedRole = role ? role.toLowerCase() : '';
        const { year, month, classId } = req.query;

        if (!year || !month) {
            return res.status(400).json({ error: "year and month query params are required." });
        }

        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDateObj = new Date(year, month, 0); // last day of month
        const end = `${year}-${String(month).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

        let query = supabase
            .from('attendance_records')
            .select('*')
            .gte('date', start)
            .lte('date', end);

        if (normalizedRole === 'student') {
            query = query.eq('student_id', userId);
        } else if (normalizedRole === 'parent') {
            const { data: linkedStudents, error: linkError } = await supabase
                .from('parent_students')
                .select('student_id')
                .eq('parent_id', userId);
            if (linkError) throw linkError;
            const studentIds = (linkedStudents || []).map(r => r.student_id);
            if (studentIds.length === 0) {
                return res.status(200).json({ message: "No linked students found.", scope: "Parent", data: [] });
            }
            query = query.in('student_id', studentIds);
        } else {
            if (classId) query = query.eq('class_id', classId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return res.status(200).json({ data });
    } catch (error) {
        console.error("Error in getAttendanceCalendar:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    markAttendance,
    updateAttendance,
    viewAttendance,
    getTeacherClasses,
    getStudentsByClass,
    getRecentAttendance,
    getAttendanceSummary,
    getAttendanceCalendar
};