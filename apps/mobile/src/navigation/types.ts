import { Role } from '../constants/auth';

export interface NotificationItem {
  id: string;

  title: string;

  message: string;

  type:
    | "notification"
    | "announcement";

  status:
    | "draft"
    | "sent";

  createdAt: string;

  sentAt?: string;

  audience: {
    roles: string[];
    userIds: string[];
  };

  createdBy: string;
}

export type RootStackParamList = {
  // Academics Module
  Home: { initialRole?: 'student' | 'teacher' } | undefined;
  AttendanceList: undefined;
  MarkAttendance: { classId: string; className: string };
  AttendanceHistory: { classId: string; className: string; defaultStudentName?: string };
  AttendanceReports: { classId: string; className: string };
  AssignmentList: { classId: string; className: string };
  TeacherAssignmentList: undefined;
  TeacherAssignmentDetails: {assignmentId: string;};
  StudentSubmissionList: {assignmentId: string;};
  GradeSubmission: {submissionId: string;};
  CreateAssignment: undefined;
  AssignmentDetails: { assignmentId: string };
  SubmitAssignment: { assignmentId: string; title: string; subject: string };
  LeaveRequest: undefined;

  // Exams & Results Module
  ReportCard: undefined;
  StudentResults: undefined;
  TeacherMarksEntry: undefined;

  //Notification Module
  Notifications: undefined;
  NotificationDetails: {notification: NotificationItem;};
  CreateNotification: undefined;
  NotificationHistory: undefined;

  // Authentication Module
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  OTPVerification: { identifier?: string; type: 'email' | 'phone' };
  NewPassword: { identifier?: string };
  PasswordSuccess: undefined;
  MFA: { role: Role };
  Dashboard: { role: Role };
};
