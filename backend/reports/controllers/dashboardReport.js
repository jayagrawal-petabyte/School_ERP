const supabase = require('../supabaseClient');

const getDashboardReport = async (req, res) => {
    try {
        // Admin/Principal only, so no scoped constraints
        
        // Real metric: Recent Pass Rate based on exam_marks
        const { data: resultsData, error: resultsError } = await supabase.from('exam_marks').select('marks_obtained, passing_marks');
        if (resultsError) throw resultsError;
        
        let passCount = 0;
        resultsData.forEach(r => {
            if (Number(r.marks_obtained) >= Number(r.passing_marks)) passCount++;
        });
        const passRate = resultsData.length > 0 ? ((passCount / resultsData.length) * 100).toFixed(2) : 0;
        
        // Real metrics: Counts from users and classes
        const { count: totalStudents, error: studentsError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student');
        if (studentsError) throw studentsError;
            
        const { count: totalTeachers, error: teachersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'teacher');
        if (teachersError) throw teachersError;
            
        const { count: totalClasses, error: classesError } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true });
        if (classesError) throw classesError;
            
        // Today's attendance rate
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const { data: todayAttendance, error: attendanceError } = await supabase
            .from('attendance_records')
            .select('status')
            .eq('date', today);
        if (attendanceError) throw attendanceError;
            
        let todayPresent = 0;
        todayAttendance.forEach(a => {
            if (a.status === 'present' || a.status === 'late') todayPresent++;
        });
        const todayAttendanceRate = todayAttendance.length > 0 ? ((todayPresent / todayAttendance.length) * 100).toFixed(2) : 0;
        
        return res.json({
            success: true,
            data: {
                totalStudents: totalStudents || 0,
                totalTeachers: totalTeachers || 0,
                totalClasses: totalClasses || 0,
                todayAttendanceRate: `${todayAttendanceRate}%`,
                recentPassRate: `${passRate}%`
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDashboardReport };
