const express = require('express');
const controller = require('./assignmentController');

const router = express.Router();

router.post('/', controller.createAssignment);

router.get('/', controller.listAssignments);
router.get('/:id', controller.getAssignment);

router.patch('/:id', controller.updateAssignment);

router.delete('/:id', controller.deleteAssignment);

module.exports = router;