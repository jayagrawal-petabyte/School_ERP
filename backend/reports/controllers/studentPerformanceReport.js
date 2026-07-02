const supabase = require('../supabaseClient');

const getStudentPerformanceReport = async (req, res) => {
    try {
        const { studentId } = req.params;

        // IDOR Guard: Validate the requested studentId belongs to a class
        // the requester is authorized for. scopedClasses === null means Admin/Principal (full access).
        if (req.scopedClasses !== null) {
            const { data: memberCheck, error: memberError } = await supabase
                .from('attendance_records')
                .select('student_id')
                .eq('student_id', studentId)
                .in('class_id', req.scopedClasses)
                .limit(1);

            if (memberError) throw memberError;

            if (!memberCheck || memberCheck.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: student does not belong to your assigned classes'
                });
            }
        }

        // STUBBED: Full query logic pending DB RLS patch for exam_marks
        return res.json({
            success: true,
            message: `Stubbed performance report for student ${studentId}`,
            data: {
                attendancePercentage: '90%',
                averageMarks: 75
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStudentPerformanceReport };

