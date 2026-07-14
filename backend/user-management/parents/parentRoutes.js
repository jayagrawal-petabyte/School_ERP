const express = require('express');
const { authenticateToken } = require('../../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../../auth/middleware/role.middleware');
const ROLES = require('../../auth/constants/roles');
const { createRoleController } = require('../userController');
const { getClientFromRequest } = require('../userStore');
const service = require('../userService');

const router = express.Router();
const ctrl = createRoleController('parent');

router.use(authenticateToken);

router.post('/', authorizeRoles(ROLES.ADMIN), ctrl.create);

router.get('/', ctrl.list);

router.get('/:id', async (req, res) => {
  try {
    const supabase = getClientFromRequest(req);
    const user = await service.getUserById(req.params.id, supabase);

    if (user.role !== 'parent') {
      return res.status(404).json({ success: false, message: 'Parent not found.' });
    }

    const { data: linkedStudents, error } = await supabase
      .from('parent_students')
      .select('student_id, users!parent_students_student_id_fkey(id, full_name)')
      .eq('parent_id', req.params.id);

    if (error) throw error;

    const children = (linkedStudents || []).map(row => ({
      id: row.users?.id,
      full_name: row.users?.full_name,
    }));

    return res.status(200).json({
      success: true,
      data: { ...user, children },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Something went wrong.',
    });
  }
});

router.patch('/:id', authorizeRoles(ROLES.ADMIN), ctrl.update);

router.delete('/:id', authorizeRoles(ROLES.ADMIN), ctrl.remove);

module.exports = router;
