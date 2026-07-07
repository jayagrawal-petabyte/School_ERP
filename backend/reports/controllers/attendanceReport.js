const { getClientForUser } = require('../../services/database.service');
const cache = require('../utils/cache');

// TTL: 5 minutes. Attendance data is updated by teachers periodically,
// so a 5-minute stale window is acceptable for reporting purposes.
const CACHE_TTL_MS = 5 * 60 * 1000;

const getAttendanceReport = async (req, res) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
            return res.status(401).json({ success: false, message: 'Invalid or missing token' });
        }
        const token = authHeader.split(' ')[1];

        // Cache key must be strictly scoped to the exact user to prevent data leakage.
        // req.scopedClasses === null means admin/principal (ALL).
        const scopeKey = req.scopedClasses === null ? 'ALL' : req.scopedClasses.slice().sort().join(',');
        const cacheKey = `attendance_report:${req.user.id}:${scopeKey}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json({ ...cached, cached: true });
        }

        const supabase = getClientForUser(token);

        let query = supabase.from('attendance_records').select('status');

        // Scope logic is validated via middleware and available in req.scopedClasses
        if (req.scopedClasses !== null) {
            query = query.in('class_id', req.scopedClasses);
        }

        const { data, error } = await query;
        if (error) throw error;

        const totalDays = data.length;
        let presentDays = 0;
        data.forEach(record => {
            if (record.status === 'present' || record.status === 'late') {
                presentDays++;
            }
        });

        const overallPercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        const payload = {
            success: true,
            scopedClasses: req.scopedClasses === null ? 'ALL' : req.scopedClasses,
            data: {
                overallPercentage: `${overallPercentage}%`,
                totalRecords: totalDays
            }
        };

        cache.set(cacheKey, payload, CACHE_TTL_MS);

        return res.json(payload);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAttendanceReport };
