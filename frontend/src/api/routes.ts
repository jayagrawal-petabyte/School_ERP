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
    },
    list: "/api/users/students",
    byId: (id: string) => `/api/users/students/${id}`,
    status: (id: string) => `/api/users/students/${id}/status`,
  },

  teacher: {
    list: "/api/users/teachers",
    byId: (id: string) => `/api/users/teachers/${id}`,
    status: (id: string) => `/api/users/teachers/${id}/status`,
  },

  parent: {
    list: "/api/users/parents",
    byId: (id: string) => `/api/users/parents/${id}`,
    status: (id: string) => `/api/users/parents/${id}/status`,
  },

  assignment: {
    list: "/api/assignments",
    byId: (id: string) => `/api/assignments/${id}`,
  },

  submission: {
    submit: "/api/assignment-submission/submit",
    status: (assignmentId: string) => `/api/assignment-submission/status/${assignmentId}`,
    student: "/api/assignment-submission/student",
    assignment: (assignmentId: string) => `/api/assignment-submission/assignment/${assignmentId}`,
    download: (submissionId: string) => `/api/assignment-submission/download/${submissionId}`,
  },

  exam: {
    list: "/api/exams",
    me: "/api/exams/me",
    byId: (id: string) => `/api/exams/${id}`,
  },

  notification: {
    list: "/api/notifications",
    me: "/api/notifications/me",
    byId: (id: string) => `/api/notifications/${id}`,
  },

  report: {
    dashboard: "/api/reports/dashboard",
    attendance: "/api/reports/attendance",
    studentPerformance: (id: string) =>
      `/api/reports/student-performance/${id}`,
    results: "/api/reports/results",
  }
};
