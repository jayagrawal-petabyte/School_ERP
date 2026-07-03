export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  gender: 'M' | 'F';
}

export interface ClassInfo {
  id: string;
  name: string;
  section: string;
  studentCount: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'earlyOff' | 'festival';

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface DailyAttendance {
  classId: string;
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
}

export interface StudentHistoryRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'principal';
export type AccountStatus = 'active' | 'inactive';

export interface AppUser {
  id: string;
  role: UserRole;
  full_name: string;
  account_status: AccountStatus;
  failed_login_attempts: number;
  account_locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassRecord {
  id: string;
  class_name: string;
  section: string | null;
  created_at: string;
}

export interface TeacherProfileView extends AppUser {
  classes: ClassRecord[];
}

export interface ParentProfileView extends AppUser {
  children: AppUser[];
}

export interface StudentProfileView extends AppUser {
  classes: ClassRecord[]; 
}

export interface DashboardCard {
  id: string;
  title: string;
  emoji: string;
  color: string;
  route?: string;
  forRole: UserRole[];
}