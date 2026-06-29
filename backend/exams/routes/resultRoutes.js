const express = require('express');
const resultController = require('../controller/resultController');
const authenticateUser = require('../middleware/authenticateUser');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');
const { validateMarks } = require('../validators/resultValidator');
const resultService = require('../service/resultService');

const router = express.Router();

router.use(authenticateUser);

const resultOwnershipContext = async (req) => resultService.getOwnershipContext(req.params.id);

router.post(
  '/',
  authorize({ roles: ['admin', 'principal', 'teacher'], permissions: ['result:create'] }),
  validateMarks,
  asyncHandler(resultController.createResult)
);

router.get(
  '/me',
  authorize({ roles: ['student'], permissions: ['result:view'] }),
  asyncHandler(resultController.getMyResults)
);

router.get(
  '/',
  authorize({ roles: ['admin', 'principal', 'teacher', 'parent'], permissions: ['result:view'] }),
  asyncHandler(resultController.getAllResults)
);

router.get(
  '/:id',
  authorize({
    roles: ['admin', 'principal', 'teacher', 'parent', 'student'],
    permissions: ['result:view'],
    ownership: {
      enabled: true,
      resource: 'result',
      param: 'id',
      resolver: resultOwnershipContext,
    },
  }),
  asyncHandler(resultController.getResultById)
);

router.put(
  '/:id',
  authorize({
    roles: ['admin', 'principal', 'teacher'],
    permissions: ['result:update'],
    ownership: {
      enabled: true,
      resource: 'result',
      param: 'id',
      resolver: resultOwnershipContext,
    },
  }),
  validateMarks,
  asyncHandler(resultController.updateResult)
);

module.exports = router;
