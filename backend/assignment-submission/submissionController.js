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

        const submission = submissionService.submitAssignment(
            req.body,
            req.file,
            user
        );

        return sendResponse(res, 201, submission);

    } catch (error) {
        return handleError(res, error);
    }
}

function getSubmissionStatus(req, res) {
    try {
        const submission = submissionService.getSubmissionStatus(
            req.params.submissionId
        );

        return sendResponse(res, 200, submission);

    } catch (error) {
        return handleError(res, error);
    }
}

function getStudentSubmissions(req, res) {
    try {
        const user = submissionService.readUser(req);

        const submissions = submissionService.getStudentSubmissions(user);

        return sendResponse(res, 200, submissions);

    } catch (error) {
        return handleError(res, error);
    }
}

function getAssignmentSubmissions(req, res) {
    try {
        const user = submissionService.readUser(req);

        const submissions = submissionService.getAssignmentSubmissions(
            req.params.assignmentId,
            user
        );

        return sendResponse(res, 200, submissions);

    } catch (error) {
        return handleError(res, error);
    }
}

function downloadSubmission(req, res) {
    try {
        const user = submissionService.readUser(req);

        const submission = submissionService.downloadSubmission(
            req.params.submissionId,
            user
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