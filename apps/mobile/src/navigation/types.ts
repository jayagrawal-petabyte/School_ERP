import { Role } from '../constants/auth';

export type RootStackParamList = {
  // Academics Module
  Home: { initialRole?: 'student' | 'teacher' | 'parent'; userId?: string } | undefined;
  StudentProfile: { userId: string };
  TeacherProfile: { userId: string };
  ParentProfile: { userId: string };
  EditProfile: { userId: string; role: 'student' | 'teacher' | 'parent'; currentName: string };
  Settings: undefined;
  AttendanceList: undefined;
  MarkAttendance: { classId: string; className: string };
  AttendanceHistory: { classId: string; className: string; defaultStudentName?: string };
  AttendanceReports: { classId: string; className: string };
  AssignmentList: { classId: string; className: string };
  AssignmentDetails: { assignmentId: string };
  SubmitAssignment: { assignmentId: string; title: string; subject: string };
  LeaveRequest: undefined;

  // Exams & Results Module
  ReportCard: undefined;
  StudentResults: undefined;
  TeacherMarksEntry: undefined;

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
