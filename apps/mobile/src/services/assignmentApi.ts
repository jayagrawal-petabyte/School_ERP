import { API_CONFIG, getAuthHeaders } from '../config/apiConfig';

const assignmentApi = {
    getAssignments: async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignments`, {
                method: 'GET',
                headers,
            });
            if (!response.ok) throw new Error('Failed to fetch assignments');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching assignments:', error);
            throw error;
        }
    },

    getAssignment: async (assignmentId: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignments/${assignmentId}`, {
                method: 'GET',
                headers,
            });
            if (!response.ok) throw new Error('Failed to fetch assignment details');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching assignment:', error);
            throw error;
        }
    },

    getSubmissionStatus: async (assignmentId: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignment-submission/status/${assignmentId}`, {
                method: 'GET',
                headers,
            });
            if (!response.ok) throw new Error('Failed to fetch submission status');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching submission status:', error);
            throw error;
        }
    },

    getTeacherAssignments: async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignments/teacher`, {
                method: 'GET',
                headers,
            });
            if (!response.ok) throw new Error('Failed to fetch teacher assignments');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching teacher assignments:', error);
            throw error;
        }
    },
    
    createAssignment: async (data: {
        title: string;
        subject: string;
        className: string;
        description: string;
        dueDate: string;
    }) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignments`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: data.title,
                    subject: data.subject,
                    className: data.className,
                    description: data.description,
                    dueDate: data.dueDate,
                }),
            });
            if (!response.ok) throw new Error('Failed to create assignment');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error creating assignment:', error);
            throw error;
        }
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
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignments/${assignmentId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update assignment');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error updating assignment:', error);
            throw error;
        }
    },

    deleteAssignment: async (assignmentId: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignments/${assignmentId}`, {
                method: 'DELETE',
                headers,
            });
            if (!response.ok) throw new Error('Failed to delete assignment');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error deleting assignment:', error);
            throw error;
        }
    },

    getAssignmentSubmissions: async (assignmentId: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignment-submissions/assignment/${assignmentId}`, {
                method: 'GET',
                headers,
            });
            if (!response.ok) throw new Error('Failed to fetch assignment submissions');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching assignment submissions:', error);
            throw error;
        }
    },

    downloadSubmission: async (submissionId: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignment-submissions/download/${submissionId}`, {
                method: 'GET',
                headers,
            });
            if (!response.ok) throw new Error('Failed to download submission');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error downloading submission:', error);
            throw error;
        }
    },

    gradeSubmission: async (
        submissionId: string,
        obtainedMarks: number,
        teacherFeedback: string,
    ) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignment-submission/${submissionId}/grade`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    obtainedMarks,
                    teacherFeedback,
                }),
            });
            if (!response.ok) throw new Error('Failed to grade submission');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error grading submission:', error);
            throw error;
        }
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
        try {
            const authHeaders = await getAuthHeaders();
            const headers: Record<string, string> = { ...authHeaders };
            delete headers['Content-Type'];

            const formData = new FormData();
            formData.append("notes", notes);
            formData.append("file", {
                uri: attachedFile.uri,
                name: attachedFile.name,
                type: attachedFile.type,
            } as any);

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignment-submissions/${assignmentId}`, {
                method: 'POST',
                headers,
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to submit assignment');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error submitting assignment:', error);
            throw error;
        }
    },
};

export default assignmentApi;
