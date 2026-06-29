const express = require('express');
const authMiddleware = require('./authMiddleware');
const controller = require('./userController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', controller.createUser);

router.get('/', controller.listUsers);
router.get('/:id', controller.getUser);

router.patch('/:id', controller.updateUser);
router.patch('/:id/status', controller.toggleStatus);

router.delete('/:id', controller.deleteUser);

module.exports = router;
