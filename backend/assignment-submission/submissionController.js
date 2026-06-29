// backend/assignment-submission/submissionController.js

const submissionService = require("./submissionService");

const submitAssignment = async (req, res) => {
    try {
        const result = await submissionService.submitAssignment(req);

        return res.status(201).json({
            success: true,
            message: "Assignment submitted successfully.",
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getSubmissionStatus = async (req, res) => {
    try {
        const result = await submissionService.getSubmissionStatus(
            req.params.submissionId
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const getStudentSubmissions = async (req, res) => {
    try {
        const result = await submissionService.getStudentSubmissions(req);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAssignmentSubmissions = async (req, res) => {
    try {
        const result = await submissionService.getAssignmentSubmissions(
            req.params.assignmentId,
            req
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const downloadSubmission = async (req, res) => {
    try {
        const result = await submissionService.downloadSubmission(
            req.params.submissionId,
            req
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    submitAssignment,
    getSubmissionStatus,
    getStudentSubmissions,
    getAssignmentSubmissions,
    downloadSubmission
};