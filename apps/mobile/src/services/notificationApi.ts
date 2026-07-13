import { api } from "./api";

const notificationApi = {
    getNotifications: async () => {
        const response = await api.get("/notifications");
        return response.data.data;
    },

    getNotification: async (notificationId: string) => {
        const response = await api.get(`/notifications/${notificationId}`);
        return response.data.data;
    },

    createNotification: async (data: {
        title: string;
        message: string;
        type: "general" | "announcement" | "reminder" | "alert";
        targetAudience: "students" | "teachers" | "all" | "class";
    }) => {
        const response = await api.post("/notifications", {
            title: data.title,
            message: data.message,
            type: data.type,
            targetAudience: data.targetAudience,
        });
        return response.data.data;
    },

    createAndSendNotification: async (data: {
        title: string;
        message: string;
        type: "general" | "announcement" | "reminder" | "alert";
        targetAudience: "students" | "teachers" | "all" | "class";
    }) => {
        const response = await api.post("/notifications/send", {
            title: data.title,
            message: data.message,
            type: data.type,
            targetAudience: data.targetAudience,
        });
        return response.data.data;
    },

    getMyNotifications: async () => {
        const response = await api.get("/notifications/me");
        return response.data.data;
    },

    getNotificationHistory: async () => {
        const response = await api.get("/notifications/history");
        return response.data.data;
    },

    updateAnnouncement: async (
        notificationId: string,
        data: {
            title: string;
            message: string;
            targetAudience: "students" | "teachers" | "all" | "class";
        },
    ) => {
        const response = await api.patch(`/notifications/announcements/${notificationId}`,{
            title: data.title,
            message: data.message,
            targetAudience: data.targetAudience,
        });
        return response.data.data;
    },

    deleteAnnouncement: async (notificationId: string) => {
        const response = await api.delete(`/notifications/announcements/${notificationId}`);
        return response.data.data;
    },
};

export default notificationApi;
