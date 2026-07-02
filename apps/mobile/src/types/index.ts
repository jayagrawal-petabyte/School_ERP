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
