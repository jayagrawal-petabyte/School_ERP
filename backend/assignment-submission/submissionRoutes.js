const express = require("express");

const router = express.Router();

const upload = require("./uploadMiddleware");

const {
    submitAssignment,
    getSubmissionStatus,
    getStudentSubmissions,
    getAssignmentSubmissions,
    downloadSubmission
} = require("./submissionController");

router.post("/submit", submitAssignment);

router.get("/status/:submissionId", getSubmissionStatus);

router.get("/student", getStudentSubmissions);

router.get("/assignment/:assignmentId", getAssignmentSubmissions);

router.get("/download/:submissionId", downloadSubmission);

module.exports = router;