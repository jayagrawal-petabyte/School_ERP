import { api } from "./api";

export type NotificationType = | "general" | "announcement" | "reminder" | "alert";
export type TargetAudience = | "students" | "teachers" | "all" | "class";

const notificationApi = {
  createNotification: async (data: {
    title: string;
    message: string;
    type: NotificationType;
    targetAudience: TargetAudience;
    classId?: string;
  }) => {
    const response = await api.post(
      "/notifications",
      data
    );
    return response.data.data;
  },

  createAndSendNotification: async (data: {
    title: string;
    message: string;
    type: NotificationType;
    targetAudience: TargetAudience;
    classId?: string;
  }) => {
    const response = await api.post(
      "/notifications/send",
      data
    );
    return response.data.data;
  },

  getMyNotifications: async () => {
    const response = await api.get(
      "/notifications/me"
    );
    return response.data.data || [];
  },

  getNotificationHistory: async () => {
    const response = await api.get(
      "/notifications/history"
    );
    return response.data.data || [];
  },

  deleteAnnouncement: async (
    notificationId: string
  ) => {
    const response = await api.delete(
      `/notifications/announcements/${notificationId}`
    );
    return response.data.data;
  },
};

export default notificationApi;
