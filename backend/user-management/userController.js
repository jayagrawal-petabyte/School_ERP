const service = require('./userService');

function sendResponse(res, statusCode, data) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function handleError(res, error) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Something went wrong.',
  });
}

function createUser(req, res) {
  try {
    const currentUser = service.readUser(req);
    const user = service.createUser(req.body, currentUser);

    return sendResponse(res, 201, user);
  } catch (error) {
    return handleError(res, error);
  }
}

function updateUser(req, res) {
  try {
    const currentUser = service.readUser(req);
    const user = service.updateUser(req.params.id, req.body, currentUser);

    return sendResponse(res, 200, user);
  } catch (error) {
    return handleError(res, error);
  }
}

function deleteUser(req, res) {
  try {
    const currentUser = service.readUser(req);
    const user = service.deleteUser(req.params.id, currentUser);

    return sendResponse(res, 200, user);
  } catch (error) {
    return handleError(res, error);
  }
}

function getUser(req, res) {
  try {
    const user = service.getUserById(req.params.id);

    return sendResponse(res, 200, user);
  } catch (error) {
    return handleError(res, error);
  }
}

function listUsers(req, res) {
  try {
    const users = service.listUsers({
      role: req.query.role,
      accountStatus: req.query.status,
    });

    return sendResponse(res, 200, users);
  } catch (error) {
    return handleError(res, error);
  }
}

function toggleStatus(req, res) {
  try {
    const currentUser = service.readUser(req);
    const user = service.toggleStatus(req.params.id, currentUser);

    return sendResponse(res, 200, user);
  } catch (error) {
    return handleError(res, error);
  }
}

function createRoleController(role) {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return {
    create(req, res) {
      try {
        const currentUser = service.readUser(req);
        const user = service.createUser(
          { ...req.body, role },
          currentUser
        );

        return sendResponse(res, 201, user);
      } catch (error) {
        return handleError(res, error);
      }
    },

    list(req, res) {
      try {
        const users = service.listUsers({
          role,
          accountStatus: req.query.status,
        });

        return sendResponse(res, 200, users);
      } catch (error) {
        return handleError(res, error);
      }
    },

    getById(req, res) {
      try {
        const user = service.getUserById(req.params.id);

        if (user.role !== role) {
          return res.status(404).json({
            success: false,
            message: roleLabel + ' not found.',
          });
        }

        return sendResponse(res, 200, user);
      } catch (error) {
        return handleError(res, error);
      }
    },

    update(req, res) {
      try {
        const currentUser = service.readUser(req);

        const target = service.getUserById(req.params.id);

        if (target.role !== role) {
          return res.status(404).json({
            success: false,
            message: roleLabel + ' not found.',
          });
        }

        const user = service.updateUser(req.params.id, req.body, currentUser);

        return sendResponse(res, 200, user);
      } catch (error) {
        return handleError(res, error);
      }
    },

    remove(req, res) {
      try {
        const currentUser = service.readUser(req);

        const target = service.getUserById(req.params.id);

        if (target.role !== role) {
          return res.status(404).json({
            success: false,
            message: roleLabel + ' not found.',
          });
        }

        const user = service.deleteUser(req.params.id, currentUser);

        return sendResponse(res, 200, user);
      } catch (error) {
        return handleError(res, error);
      }
    },
  };
}

module.exports = {
  createRoleController,
  createUser,
  deleteUser,
  getUser,
  listUsers,
  toggleStatus,
  updateUser,
};
