import { AssignmentService } from './api';

export const assignmentApi = {
  getAssignments: async () => {
    return await AssignmentService.getAssignments();
  },

  getAssignment: async (assignmentId: string) => {
    return await AssignmentService.getAssignmentDetails(assignmentId);
  },

  getSubmissionStatus: async (assignmentId: string) => {
    const assignment = await AssignmentService.getAssignmentDetails(assignmentId);
    if (assignment && assignment.submission) {
      return {
        ...assignment.submission,
        status: assignment.status,
      };
    }
    return null;
  },

  submitAssignment: async (
    assignmentId: string,
    notes: string,
    attachedFile: { name: string }
  ) => {
    return await AssignmentService.submitAssignment(
      assignmentId,
      notes,
      attachedFile.name
    );
  },
};

export default assignmentApi;
