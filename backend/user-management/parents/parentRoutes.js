const express = require('express');
const { authenticateToken } = require('../../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../../auth/middleware/role.middleware');
const ROLES = require('../../auth/constants/roles');
const { createRoleController } = require('../userController');

const router = express.Router();
const ctrl = createRoleController('parent');

router.use(authenticateToken);

router.post('/', authorizeRoles(ROLES.ADMIN), ctrl.create);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

router.patch('/:id', authorizeRoles(ROLES.ADMIN), ctrl.update);

router.delete('/:id', authorizeRoles(ROLES.ADMIN), ctrl.remove);

module.exports = router;
