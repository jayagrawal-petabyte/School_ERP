const express = require('express');
const authMiddleware = require('../authMiddleware');
const { createRoleController } = require('../userController');

const router = express.Router();
const ctrl = createRoleController('student');

router.use(authMiddleware);

router.post('/', ctrl.create);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

router.patch('/:id', ctrl.update);

router.delete('/:id', ctrl.remove);

module.exports = router;
