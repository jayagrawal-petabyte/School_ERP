const supabase = require('../supabaseClient');

const getAttendanceReport = async (req, res) => {
    try {
        let query = supabase.from('attendance_records').select('*');
        
        // Scope logic is validated via middleware and available in req.scopedClasses
        if (req.scopedClasses !== null) {
            query = query.in('class_id', req.scopedClasses);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        let presentDays = 0;
        const totalDays = data.length;
        
        // Count present and late as "attended"
        data.forEach(record => {
            if (record.status === 'present' || record.status === 'late') {
                presentDays++;
            }
        });
        
        const overallPercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
        
        return res.json({
            success: true,
            scopedClasses: req.scopedClasses || 'ALL',
            data: {
                overallPercentage: `${overallPercentage}%`,
                totalRecords: totalDays,
                records: data
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAttendanceReport };
