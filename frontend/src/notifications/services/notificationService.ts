import type { Notification } from "../types/notification";

// Dummy static notifications data
const dummyNotifications: Notification[] = [
  {
    id: "1",
    title: "Math Assignment Due",
    message: "Complete exercises 5-10 on page 42.",
    type: "assignment",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  },
  {
    id: "2",
    title: "Science Exam Scheduled",
    message: "Physics exam on Friday, 10 AM.",
    type: "exam",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "3",
    title: "Attendance Alert",
    message: "You missed 2 classes this week.",
    type: "attendance",
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
  },
  {
    id: "4",
    title: "School Holiday",
    message: "No classes on Monday due to public holiday.",
    type: "announcement",
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "5",
    title: "History Assignment",
    message: "Write a short essay on World War II.",
    type: "assignment",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
  },
  {
    id: "6",
    title: "Exam Results",
    message: "Your Math exam scores are now available.",
    type: "exam",
    read: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: "7",
    title: "Attendance Reminder",
    message: "Please sign in for today's class.",
    type: "attendance",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h ago
  },
  {
    id: "8",
    title: "New Announcement",
    message: "Parent-teacher meeting scheduled for next week.",
    type: "announcement",
    read: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
  },
];

export const getNotifications = async (): Promise<Notification[]> => {
  // Simulate async fetch with a short delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(dummyNotifications), 200);
  });
};
