// src/notifications/pages/Notifications.tsx

import { useEffect, useState, useMemo, type FC } from "react";
import type { Notification, NotificationType } from "../types/notification";
import { getNotifications } from "../services/notificationService";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import type { FilterOption } from "../components/NotificationFilter";

export const NotificationsPage: FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterOption>("all");

  useEffect(() => {
    // fetch dummy data
    getNotifications().then((data) => {
      setNotifications(data);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = notifications;
    if (filter === "unread") {
      result = result.filter((n) => !n.read);
    } else if (filter !== "all") {
      const type = filter as NotificationType;
      result = result.filter((n) => n.type === type);
    }
    return result;
  }, [filter, notifications]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Notifications</h1>
      <p className="text-gray-600 mb-4">Stay updated with the latest assignments, exams, attendance alerts and announcements.</p>

      <NotificationFilter active={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No notifications to display.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
};
