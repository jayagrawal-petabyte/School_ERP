const submissionService = require("./submissionService");

function sendResponse(res, statusCode, data) {
    return res.status(statusCode).json({
        success: true,
        data
    });
}

function handleError(res, error) {
    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Something went wrong."
    });
}

function submitAssignment(req, res) {
    try {
        const user = submissionService.readUser(req);
        const authHeader = req.get("Authorization");

        const submission = submissionService.submitAssignment(
            req.body,
            req.file,
            user,
            authHeader
        );

        return sendResponse(res, 201, submission);

    } catch (error) {
        return handleError(res, error);
    }
}

function getSubmissionStatus(req, res) {
    try {
        const user = submissionService.readUser(req);
        const authHeader = req.get("Authorization");

        const status = submissionService.getSubmissionStatus(
            req.params.assignmentId,
            user,
            authHeader
        );

        return sendResponse(res, 200, status);

    } catch (error) {
        return handleError(res, error);
    }
}

function getStudentSubmissions(req, res) {
    try {
        const user = submissionService.readUser(req);
        const authHeader = req.get("Authorization");

        const submissions = submissionService.getStudentSubmissions(
            user,
            authHeader
        );

        return sendResponse(res, 200, submissions);

    } catch (error) {
        return handleError(res, error);
    }
}

function getAssignmentSubmissions(req, res) {
    try {
        const user = submissionService.readUser(req);
        const authHeader = req.get("Authorization");

        const submissions = submissionService.getAssignmentSubmissions(
            req.params.assignmentId,
            user,
            authHeader
        );

        return sendResponse(res, 200, submissions);

    } catch (error) {
        return handleError(res, error);
    }
}

function downloadSubmission(req, res) {
    try {
        const user = submissionService.readUser(req);
        const authHeader = req.get("Authorization");

        const submission = submissionService.downloadSubmission(
            req.params.assignmentId,
            user,
            authHeader
        );

        return sendResponse(res, 200, submission);

    } catch (error) {
        return handleError(res, error);
    }
}

module.exports = {
    submitAssignment,
    getSubmissionStatus,
    getStudentSubmissions,
    getAssignmentSubmissions,
    downloadSubmission
};