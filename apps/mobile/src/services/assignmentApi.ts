import { api } from "./api";

const assignmentApi = {
    getAssignments: async () => {
        const response = await api.get("/assignments");
        return response.data.data;
    },

    getAssignment: async (assignmentId: string) => {
        const response = await api.get(`/assignments/${assignmentId}`);
        return response.data.data;
    },

    getSubmissionStatus: async (assignmentId: string) => {
        const response = await api.get(
            `/assignment-submission/status/${assignmentId}`,
        );

        return response.data.data;
    },

    getTeacherAssignments: async () => {
        const response = await api.get("/assignments/teacher");
        return response.data.data;
    },
    
    createAssignment: async (data: {
        title: string;
        subject: string;
        className: string;
        description: string;
        dueDate: string;
        maxMarks: number;
        referenceFile?: any;
    }) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("subject", data.subject);
        formData.append("className", data.className);
        formData.append("description", data.description);
        formData.append("dueDate", data.dueDate);
        formData.append(
            "maxMarks",
            String(data.maxMarks)
        );
        if (data.referenceFile) {
            formData.append("referenceFile", data.referenceFile as any);
        }
        const response = await api.post("/assignments", formData, {
            headers: {"Content-Type": "multipart/form-data",},
        });
    return response.data.data;
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
        },
    ) => {
        const response = await api.patch(`/assignments/${assignmentId}`, data);

        return response.data.data;
    },

    deleteAssignment: async (assignmentId: string) => {
        const response = await api.delete(`/assignments/${assignmentId}`);

        return response.data.data;
    },

    getAssignmentSubmissions: async (assignmentId: string) => {
        const response = await api.get(`/assignment-submissions/assignment/${assignmentId}`);
        return response.data.data;
    },

    getSubmissionStatus: async (assignmentId: string) => {
        const response = await api.get(`/assignment-submissions/status/${assignmentId}`);
        return response.data.data;
    },

    downloadSubmission: async (submissionId: string) => {
        const response = await api.get(`/assignment-submissions/download/${submissionId}`);
        return response.data.data;
    },

    gradeSubmission: async (
        submissionId: string,
        obtainedMarks: number,
        teacherFeedback: string,
    ) => {
        const response = await api.patch(
            `/assignment-submission/${submissionId}/grade`,
            {
                obtainedMarks,
                teacherFeedback,
            },
        );

        return response.data.data;
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
        formData.append("notes", notes);
        formData.append("file", {
            uri: attachedFile.uri,
            name: attachedFile.name,
            type: attachedFile.type,
        } as any);
        const response = await api.post(`/assignment-submissions/${assignmentId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    },
};

export default assignmentApi;
