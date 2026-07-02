const submissionStore = require("./submissionStore");

function readUser(req) {
    return req.user || req.currentUser || {};
}

function requireStudent(user) {
    const role = String(user.role || "").toLowerCase();

    if (role !== "student") {
        const error = new Error(
            "Only students can submit assignments."
        );
        error.statusCode = 403;
        throw error;
    }
}

function validateSubmission(payload, file) {

    const assignmentId = String(payload.assignmentId || "").trim();

    if (!assignmentId) {
        const error = new Error("Assignment ID is required.");
        error.statusCode = 400;
        throw error;
    }

    if (!file) {
        const error = new Error("Assignment file is required.");
        error.statusCode = 400;
        throw error;
    }

    return assignmentId;
}

function submitAssignment(payload, file, user) {

    requireStudent(user);

    const assignmentId = validateSubmission(payload, file);

    const existingSubmission =
        submissionStore.findSubmissionByAssignmentAndStudent(
            assignmentId,
            user.id
        );

    if (existingSubmission) {
        const error = new Error(
            "Assignment already submitted."
        );
        error.statusCode = 409;
        throw error;
    }

    return submissionStore.addSubmission({
        assignmentId,
        studentId: user.id,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        status: "submitted"
    });
}

function getSubmissionStatus(id) {

    const submission =
        submissionStore.findSubmission(id);

    if (!submission) {
        const error = new Error("Submission not found.");
        error.statusCode = 404;
        throw error;
    }

    return submission;
}

function getStudentSubmissions(user) {

    requireStudent(user);

    return submissionStore.findStudentSubmissions(
        user.id
    );
}

function getAssignmentSubmissions(
    assignmentId,
    user
) {

    const role = String(user.role || "").toLowerCase();

    if (
        role !== "teacher" &&
        role !== "admin"
    ) {
        const error = new Error(
            "Only teachers and admins can view assignment submissions."
        );
        error.statusCode = 403;
        throw error;
    }

    return submissionStore.findAssignmentSubmissions(
        assignmentId
    );
}

function downloadSubmission(id) {

    const submission =
        submissionStore.findSubmission(id);

    if (!submission) {
        const error = new Error("Submission not found.");
        error.statusCode = 404;
        throw error;
    }

    return submission;
}

module.exports = {
    submitAssignment,
    getSubmissionStatus,
    getStudentSubmissions,
    getAssignmentSubmissions,
    downloadSubmission,
    readUser
};