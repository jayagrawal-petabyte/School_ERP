// backend/assignment-submission/submissionService.js

const submissionStore = require("./submissionStore");

const submitAssignment = async (req) => {
    return submissionStore.createSubmission(req);
};

const getSubmissionStatus = async (submissionId) => {
    return submissionStore.findSubmissionById(submissionId);
};

const getStudentSubmissions = async (req) => {
    return submissionStore.findStudentSubmissions(req.user.id);
};

const getAssignmentSubmissions = async (assignmentId, req) => {
    return submissionStore.findAssignmentSubmissions(
        assignmentId,
        req.user.id
    );
};

const downloadSubmission = async (submissionId, req) => {
    return submissionStore.downloadSubmissionFile(
        submissionId,
        req.user.id
    );
};

module.exports = {
    submitAssignment,
    getSubmissionStatus,
    getStudentSubmissions,
    getAssignmentSubmissions,
    downloadSubmission
};