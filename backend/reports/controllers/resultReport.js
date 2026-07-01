const supabase = require('../supabaseClient');

const getResultsReport = async (req, res) => {
    try {
        let query = supabase.from('exam_marks').select('*');
        
        // Scope the query
        if (req.scopedClasses !== null) {
            // Apply scoped rules for teachers, same as attendance: 
            // class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
            query = query.in('class_id', req.scopedClasses);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Aggregation logic
        let totalMarks = 0;
        let passCount = 0;
        
        data.forEach(result => {
            totalMarks += Number(result.marks_obtained) || 0;
            if (Number(result.marks_obtained) >= Number(result.passing_marks)) passCount++;
        });
        
        const avgMarks = data.length > 0 ? (totalMarks / data.length).toFixed(2) : 0;
        const passRate = data.length > 0 ? ((passCount / data.length) * 100).toFixed(2) : 0;
        
        // Return aggregates only — never dump raw student exam rows (data minimization)
        return res.json({
            success: true,
            data: {
                totalResults: data.length,
                averageMarks: avgMarks,
                passRate: `${passRate}%`
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getResultsReport };
