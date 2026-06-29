const supabase = require('../supabaseClient');

const getResultsReport = async (req, res) => {
    try {
        let query = supabase.from('results').select('*');
        
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
        // Assuming pass marks threshold is 40 for this aggregate, ideally fetched from a configuration or exams table
        
        data.forEach(result => {
            totalMarks += Number(result.marks) || 0;
            if (Number(result.marks) >= 40) passCount++;
        });
        
        const avgMarks = data.length > 0 ? (totalMarks / data.length).toFixed(2) : 0;
        const passRate = data.length > 0 ? ((passCount / data.length) * 100).toFixed(2) : 0;
        
        return res.json({
            success: true,
            data: {
                totalResults: data.length,
                averageMarks: avgMarks,
                passRate: `${passRate}%`,
                results: data
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getResultsReport };
