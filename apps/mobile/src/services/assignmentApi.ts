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
        const response = await api.get("/assignments");
        return response.data.data;
    },

    createAssignment: async (data: {
        title: string;
        subject: string;
        className: string;
        description: string;
        classId: string;
        dueDate: string;
        maxMarks: number;
        referenceFile?: {
            uri: string;
            name: string;
            type: string;
        } | null;
    }) => {
        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("subject", data.subject);
        formData.append("className", data.className);
        formData.append("description", data.description);
        formData.append("classId", data.classId);
        formData.append("dueDate", data.dueDate);
        formData.append("maxMarks", String(data.maxMarks));

        if (data.referenceFile) {
            formData.append("referenceFile", {
                uri: data.referenceFile.uri,
                name: data.referenceFile.name,
                type: data.referenceFile.type,
            } as any);
        }

        const response = await api.post("/assignments", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
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

    /*deleteAssignment: async (assignmentId: string) => {
        const response = await api.delete(`/assignments/${assignmentId}`);

        return response.data.data;
    },*/

    getAssignmentSubmissions: async (assignmentId: string) => {
        const response = await api.get(
            `/assignment-submission/assignment/${assignmentId}`,
        );

        return response.data.data;
    },

    getSubmission: async (submissionId: string) => {
        const response = await api.get(
            `/assignment-submission/${submissionId}`,
        );

        return response.data.data;
    },

    downloadSubmission: async (submissionId: string) => {
        const response = await api.get(
            `/assignment-submission/download/${submissionId}`,
        );

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
        attachedFile: any,
    ) => {
        const formData = new FormData();

        formData.append("notes", notes);

        formData.append("file", {
            uri: attachedFile.uri,
            type: attachedFile.type || attachedFile.type,
            name: attachedFile.name,
        } as any);

        const response = await api.post(
            `/assignments/${assignmentId}/submit`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );

        return response.data.data;
    },
};

export default assignmentApi;
