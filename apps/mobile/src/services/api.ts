import axios from "axios";
import { API_CONFIG, getAuthHeaders } from '../config/apiConfig';
import {
  Student,
  ClassInfo,
  AttendanceStatus,
  AttendanceRecord,
  DailyAttendance,
  StudentHistoryRecord,
} from "../types";

import { getToken } from "../utils/security";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined. Please configure your .env file.");
}
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken("auth_token");
    if (token && config.headers) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,(error) => {
    if (__DEV__) {console.log("Something went wrong. Please try again.");}
    return Promise.reject(error);
  }
);

export {
  Student,
  ClassInfo,
  AttendanceStatus,
  AttendanceRecord,
  DailyAttendance,
  StudentHistoryRecord,
};

export const AttendanceService = {
  getClasses: async (): Promise<ClassInfo[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/attendance/classes`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return [];
      const result = await response.json();
      const rawClasses = result.data || [];
      return rawClasses.map((c: any) => ({
        id: c.id,
        name: c.className || c.class_name || c.name || 'Unnamed Class',
        section: c.section || '',
        studentCount: c.studentCount || c.student_count || 0,
      }));
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  getStudents: async (classId: string): Promise<Student[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/attendance/students?classId=${classId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return [];
      const result = await response.json();
      const rawStudents = result.data || [];
      return rawStudents.map((s: any) => ({
        id: s.id,
        name: s.fullName || 'Unnamed Student',
        rollNumber: s.rollNumber || 'N/A',
        gender: s.gender || 'M',
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  submitAttendance: async (
    classId: string,
    date: string,
    records: AttendanceRecord[]
  ): Promise<{ success: boolean; message: string }> => {
    // If the frontend needs to submit multiple records, we either loop or use a batch endpoint.
    // The backend /api/attendance/mark takes single student. So we should probably loop.
    try {
      const headers = await getAuthHeaders();
      let successCount = 0;
      for (const record of records) {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/attendance/mark`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            classId,
            date,
            studentId: record.studentId,
            status: record.status,
          }),
        });
        if (response.ok) successCount++;
      }
      return { success: true, message: `Submitted ${successCount}/${records.length} records.` };
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      return { success: false, message: error.message || 'Network error occurred.' };
    }
  },

  getAttendanceByDate: async (classId: string, date: string): Promise<AttendanceRecord[] | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/attendance/view?classId=${classId}&date=${date}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return null;
      const result = await response.json();
      return (result.data || []).map((r: any) => ({ studentId: r.student_id, status: r.status }));
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      return null;
    }
  },

  getClassAttendanceHistory: async (classId: string): Promise<DailyAttendance[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/attendance/view?classId=${classId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return [];
      const result = await response.json();
      const rawRecords = result.data || [];
      const grouped: Record<string, any[]> = {};
      rawRecords.forEach((rec: any) => {
        if (!grouped[rec.date]) grouped[rec.date] = [];
        grouped[rec.date].push({ studentId: rec.student_id, status: rec.status });
      });
      return Object.keys(grouped).map(d => ({
        classId,
        date: d,
        records: grouped[d]
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching class history:', error);
      return [];
    }
  },

  getStudentMonthlyAttendance: async (
    studentName: string,
    classId: string,
    year: number,
    month: number
  ): Promise<StudentHistoryRecord[]> => {
    // Note: A real backend would need an endpoint for this. Falling back to empty.
    return [];
  },

  getAttendanceReport: async (classId: string): Promise<any> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/reports/attendance`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch report');
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      return null;
    }
  },
};

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  assignedBy: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  obtainedMarks?: number;
  feedback?: string;
  attachmentUrl?: string;
  submission?: {
    submittedAt: string;
    notes: string;
    fileName: string;
  };
}

export const AssignmentService = {
  getAssignments: async (classId?: string): Promise<Assignment[]> => {
    try {
      const headers = await getAuthHeaders();
      const url = classId 
        ? `${API_CONFIG.BASE_URL}/api/assignments?classId=${classId}` 
        : `${API_CONFIG.BASE_URL}/api/assignments`;
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  },

  getAssignmentDetails: async (assignmentId: string): Promise<Assignment | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignments/${assignmentId}`, { method: 'GET', headers });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      return null;
    }
  },

  submitAssignment: async (
    assignmentId: string,
    notes: string,
    fileName: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignment-submission`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ assignmentId, notes, fileName }),
      });
      if (!response.ok) return { success: false, message: 'Failed to submit' };
      return { success: true, message: 'Assignment submitted successfully!' };
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      return { success: false, message: error.message || 'Error occurred.' };
    }
  },
};

export interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export const LeaveRequestService = {
  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/leave`, { method: 'GET', headers });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }
  },

  submitLeaveRequest: async (
    leaveType: string,
    startDate: string,
    endDate: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/leave`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ leaveType, startDate, endDate, reason }),
      });
      if (!response.ok) return { success: false, message: 'Failed to submit' };
      return { success: true, message: 'Leave request submitted successfully.' };
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      return { success: false, message: error.message || 'Error occurred.' };
    }
  },
};


