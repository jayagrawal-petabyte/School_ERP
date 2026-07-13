import { api } from "./api";

const notificationApi = {
    getMyNotifications: async () => {
        const response = await api.get("/notifications/me");
        return response.data;
    },

    getNotificationHistory: async () => {
        const response = await api.get("/notifications/history");
        return response.data;
    },

    createNotification: async (data: {
        title: string;
        message: string;
        type: "notification" | "announcement";
        audience: {
            roles: string[];
            userIds: string[];
        };
    }) => {
        const response = await api.post("/notifications", data);

        return response.data;
    },

    createAndSendNotification: async (data: {
        title: string;
        message: string;
        type: "notification" | "announcement";
        audience: {
            roles: string[];
            userIds: string[];
        };
    }) => {
        const response = await api.post("/notifications/send", data);

        return response.data;
    },

    sendNotification: async (notificationId: string) => {
        const response = await api.post(
            `/notifications/${notificationId}/send`,
        );

        return response.data;
    },

    updateAnnouncement: async (
        notificationId: string,
        data: {
            title: string;
            message: string;
            audience: {
                roles: string[];
                userIds: string[];
            };
        },
    ) => {
        const response = await api.patch(
            `/notifications/announcements/${notificationId}`,
            data,
        );

        return response.data;
    },

    deleteAnnouncement: async (notificationId: string) => {
        const response = await api.delete(
            `/notifications/announcements/${notificationId}`,
        );

        return response.data;
    },
};

export default notificationApi;
