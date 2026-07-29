import apiClient from "./client";
import { API_ROUTES } from "./routes";

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status?: string;
  submittedAt?: string;
  [key: string]: any;
}

/**
 * Submit assignment (with file upload)
 * POST /api/assignment-submission/submit
 */
export const submitAssignment = async (formData: FormData) => {
  const response = await apiClient.post(
    API_ROUTES.submission.submit,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

/**
 * Get submission status for a specific assignment (student)
 * GET /api/assignment-submission/status/:assignmentId
 */
export const getSubmissionStatus = async (assignmentId: string) => {
  const response = await apiClient.get(API_ROUTES.submission.status(assignmentId));
  return response.data;
};

/**
 * Get all submissions for the current student
 * GET /api/assignment-submission/student
 */
export const getStudentSubmissions = async () => {
  const response = await apiClient.get(API_ROUTES.submission.student);
  return response.data;
};

/**
 * Get all submissions for a specific assignment (teacher/admin)
 * GET /api/assignment-submission/assignment/:assignmentId
 */
export const getAssignmentSubmissions = async (assignmentId: string) => {
  const response = await apiClient.get(API_ROUTES.submission.assignment(assignmentId));
  return response.data;
};

/**
 * Download a submission file
 * GET /api/assignment-submission/download/:submissionId
 */
export const downloadSubmission = async (submissionId: string) => {
  const response = await apiClient.get(API_ROUTES.submission.download(submissionId), {
    responseType: "blob",
  });
  return response.data;
};
