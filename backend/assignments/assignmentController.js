const service = require('./assignmentService');

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

function createAssignment(req, res) {
  try {
    const user = service.readUser(req);
    const assignment = service.createAssignment(req.body, user);

    return sendResponse(res, 201, assignment);
  } catch (error) {
    return handleError(res, error);
  }
}

function updateAssignment(req, res) {
  try {
    const user = service.readUser(req);
    const assignment = service.updateAssignment(
      req.params.id,
      req.body,
      user
    );

    return sendResponse(res, 200, assignment);
  } catch (error) {
    return handleError(res, error);
  }
}

function deleteAssignment(req, res) {
  try {
    const user = service.readUser(req);
    const assignment = service.deleteAssignment(req.params.id, user);

    return sendResponse(res, 200, assignment);
  } catch (error) {
    return handleError(res, error);
  }
}

function listAssignments(req, res) {
  try {
    const user = service.readUser(req);
    const assignments = service.listAssignments(user);

    return sendResponse(res, 200, assignments);
  } catch (error) {
    return handleError(res, error);
  }
}

function getAssignment(req, res) {
  try {
    const assignment = service.getAssignment(req.params.id);

    return sendResponse(res, 200, assignment);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listAssignments,
  getAssignment,
};