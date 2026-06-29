const { authenticateToken } = require('../../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../../auth/middleware/role.middleware');
const supabase = require('../supabaseClient');

const injectScopedClasses = async (req, res, next) => {
    // Requires authenticateToken and authorizeRoles to run first
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'admin' || req.user.role === 'principal') {
        req.scopedClasses = null; // null means all classes
        return next();
    }
    
    if (req.user.role === 'teacher') {
        try {
            const { data, error } = await supabase
                .from('class_teachers')
                .select('class_id')
                .eq('teacher_id', req.user.id);
                
            if (error) throw error;
            
            req.scopedClasses = data.map(row => row.class_id);
            return next();
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoped classes' });
        }
    }
    
    // Students and Parents are forbidden from reports
    return res.status(403).json({ success: false, message: 'Forbidden' });
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    injectScopedClasses
};
