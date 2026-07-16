
export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me"
  },
  student: {
    notifications: "/api/notifications/me",
    attendance: {
      mark: "/api/attendance/mark",
      update: "/api/attendance/update",
      view: "/api/attendance/view",
      classes: "/api/attendance/classes",
      students: "/api/attendance/students"
    },
    attendanceReports: {
      overview: "/student/attendance-reports/overview",
      subjects: "/student/attendance-reports/subjects",
      monthly: "/student/attendance-reports/monthly",
      insights: "/student/attendance-reports/insights",
      download: "/student/attendance-reports/download"
    }
  }
};
