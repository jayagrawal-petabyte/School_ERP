const supabase = require('../supabaseClient');

const getDashboardReport = async (req, res) => {
    try {
        // Admin/Principal only, so no scoped constraints
        
        // Real metric: Recent Pass Rate based on Results
        const { data: resultsData, error: resultsError } = await supabase.from('results').select('marks');
        if (resultsError) throw resultsError;
        
        let passCount = 0;
        resultsData.forEach(r => {
            if (Number(r.marks) >= 40) passCount++;
        });
        const passRate = resultsData.length > 0 ? ((passCount / resultsData.length) * 100).toFixed(2) : 0;
        
        // Stubbed metrics: Wait for Attendance schema and User aggregation structure
        const stubData = {
            totalStudents: 150,
            totalTeachers: 20,
            totalClasses: 10,
            todayAttendanceRate: "95%"
        };
        
        return res.json({
            success: true,
            data: {
                ...stubData,
                recentPassRate: `${passRate}%`
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDashboardReport };
