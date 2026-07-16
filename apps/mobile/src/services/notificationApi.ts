import { API_CONFIG, getAuthHeaders } from '../config/apiConfig';

export type NotificationType = "general" | "announcement" | "reminder" | "alert";
export type TargetAudience = "students" | "teachers" | "all" | "class";

const notificationApi = {
  createNotification: async (data: {
    title: string;
    message: string;
    type: NotificationType;
    targetAudience: TargetAudience;
    classId?: string;
  }) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create notification');
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  createAndSendNotification: async (data: {
    title: string;
    message: string;
    type: NotificationType;
    targetAudience: TargetAudience;
    classId?: string;
  }) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send notification');
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  getMyNotifications: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/me`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting my notifications:', error);
      return [];
    }
  },

  getNotificationHistory: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/history`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  },

  deleteAnnouncement: async (notificationId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/announcements/${notificationId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) throw new Error('Failed to delete announcement');
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },
};

export default notificationApi;
