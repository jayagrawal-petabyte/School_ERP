import { api } from "./api";

const assignmentApi = {
  // =========================
  // Student APIs
  // =========================

  getAssignments: async () => {
    const response = await api.get("/assignments");
    return response.data;
  },

  getAssignment: async (assignmentId: string) => {
    const response = await api.get(`/assignments/${assignmentId}`);
    return response.data;
  },

  getSubmissionStatus: async (assignmentId: string) => {
    const response = await api.get(
      `/assignment-submission/status/${assignmentId}`
    );

    return response.data;
  },

  gradeSubmission: async (submissionId: string, marks: number, feedback: string) => {
    const response = await api.patch(
      `/assignment-submission/${submissionId}/grade`,
      {marks,feedback,}
    );
    return response.data;
  },

  submitAssignment: async (
    assignmentId: string,
    notes: string,
    attachedFile: {
      uri: string;
      name: string;
      type: string;
    }
  ) => {
    const formData = new FormData();

    formData.append("assignmentId", assignmentId);
    formData.append("notes", notes);

    formData.append(
      "file",
      {
        uri: attachedFile.uri,
        name: attachedFile.name,
        type: attachedFile.type,
      } as any
    );

    const response = await api.post(
      "/assignment-submission/submit",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  // =========================
  // Teacher APIs
  // =========================

  getTeacherAssignments: async () => {
    const response = await api.get("/assignments");
    return response.data;
  },

  createAssignment: async (data: {
    title: string;
    subject: string;
    className: string;
    description: string;
    dueDate: string;
    maxMarks: number;
    referenceFile?: {
        uri: string;
        name: string;
        type: string;
        size?: number;
    } | null;
    }) => {
  

    const response = await api.post("/assignments", {
      title: data.title,
      subject: data.subject,
      className: data.className,
      description: data.description,
      dueDate: data.dueDate,
      maxMarks: data.maxMarks,
    });

    return response.data;
  },

  updateAssignment: async (
    assignmentId: string,
    data: {
      title: string;
      subject: string;
      className: string;
      description: string;
      dueDate: string;
      maxMarks: number;
    }
  ) => {
    const response = await api.patch(
      `/assignments/${assignmentId}`,
      data
    );

    return response.data;
  },

  deleteAssignment: async (assignmentId: string) => {
    const response = await api.delete(
      `/assignments/${assignmentId}`
    );

    return response.data;
  },

  getAssignmentSubmissions: async (
    assignmentId: string
  ) => {
    const response = await api.get(
      `/assignment-submission/assignment/${assignmentId}`
    );

    return response.data;
  },

  downloadSubmission: async (
    submissionId: string
  ) => {
    const response = await api.get(
      `/assignment-submission/download/${submissionId}`
    );

    return response.data;
  },
};

export default assignmentApi;