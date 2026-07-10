import { API_CONFIG, getAuthHeaders } from '../config/apiConfig';
import { AttendanceService } from './api';
import { Student, AttendanceRecord, DailyAttendance, StudentHistoryRecord } from '../types';

export const attendanceApi = {
  getStudents: async (classId: string): Promise<Student[]> => {
    if (!API_CONFIG.BASE_URL) {
      return await AttendanceService.getStudents(classId);
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/students?classId=${classId}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch students');
      }

      const rawStudents = result.data || [];
      return rawStudents.map((s: any) => ({
        id: s.id,
        name: s.fullName || s.full_name || 'Unnamed Student',
        rollNumber: s.rollNumber || s.roll_number || (s.id ? s.id.split('-').pop().toUpperCase().replace(/^0+/, '') || s.id.substring(0, 6) : 'N/A'),
        gender: s.gender || 'M',
      }));
    } catch (error) {
      console.error('Error fetching students from API:', error);
      return [];
    }
  },

  markAttendance: async (
    date: string,
    studentId: string,
    status: 'present' | 'absent' | 'late',
    classId: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    if (!API_CONFIG.BASE_URL) {
      const res = await AttendanceService.submitAttendance(classId, date, [{ studentId, status }]);
      return { success: res.success, message: res.message };
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/attendance/mark`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ date, studentId, status, classId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark attendance');
      }

      return { success: true, message: result.message || 'Attendance marked successfully.', data: result.data };
    } catch (error: any) {
      console.error('Error in markAttendance:', error);
      return { success: false, message: error.message || 'Network error occurred.' };
    }
  },

  updateAttendance: async (
    recordId: string,
    date: string,
    status: 'present' | 'absent' | 'late'
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    if (!API_CONFIG.BASE_URL) {
      return { success: true, message: 'Mock update successful.' };
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/attendance/update/${recordId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ date, status }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update attendance');
      }

      return { success: true, message: result.message || 'Attendance updated successfully.', data: result.data };
    } catch (error: any) {
      console.error('Error in updateAttendance:', error);
      return { success: false, message: error.message || 'Network error occurred.' };
    }
  },

  viewAttendance: async (
    classId?: string,
    date?: string
  ): Promise<any[]> => {
    if (!API_CONFIG.BASE_URL) {
      if (classId) {
        if (date) {
          const records = await AttendanceService.getAttendanceByDate(classId, date);
          return records || [];
        }
        const history = await AttendanceService.getClassAttendanceHistory(classId);
        return history;
      }
      return [];
    }

    try {
      const headers = await getAuthHeaders();
      let url = `${API_CONFIG.BASE_URL}/api/attendance/view`;
      const params = [];
      if (classId) params.push(`classId=${classId}`);
      if (date) params.push(`date=${date}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url, { method: 'GET', headers });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch attendance');
      }

      const rawRecords = result.data || [];
      
      if (!date) {
        // Group by date to match DailyAttendance[] format
        const grouped: Record<string, any[]> = {};
        rawRecords.forEach((rec: any) => {
          if (!grouped[rec.date]) grouped[rec.date] = [];
          grouped[rec.date].push({
            studentId: rec.student_id,
            status: rec.status,
          });
        });
        
        const history: DailyAttendance[] = Object.keys(grouped).map(d => ({
          classId: classId || 'unknown',
          date: d,
          records: grouped[d]
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return history;
      }

      // If fetching for a specific date, just return the mapped records
      if (date) {
        return rawRecords.map((rec: any) => ({
          studentId: rec.student_id,
          status: rec.status,
        }));
      }

      return rawRecords;
    } catch (error) {
      console.error('Error in viewAttendance:', error);
      return [];
    }
  },

  getAttendanceReport: async (
    classId: string
  ): Promise<{
    classId: string;
    className: string;
    totalStudents: number;
    averageAttendanceRate: number;
    totalSessions: number;
    presentRate: number;
    absentRate: number;
    lateRate: number;
    earlyOffRate: number;
    festivalRate: number;
    studentSummaries: {
      studentId: string;
      studentName: string;
      rollNumber: string;
      totalDays: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      earlyOffCount: number;
      festivalCount: number;
      percentage: number;
    }[];
  }> => {
    if (!API_CONFIG.BASE_URL) {
      return await AttendanceService.getAttendanceReport(classId);
    }

    try {
      const students = await attendanceApi.getStudents(classId);
      const records = await attendanceApi.viewAttendance(classId);
      
      const studentMap: Record<string, { present: number; absent: number; late: number; total: number }> = {};
      students.forEach((s) => {
        studentMap[s.id] = { present: 0, absent: 0, late: 0, total: 0 };
      });

      records.forEach((rec: any) => {
        const studentId = rec.student_id;
        const status = rec.status;
        if (studentMap[studentId]) {
          studentMap[studentId].total++;
          if (status === 'present') studentMap[studentId].present++;
          else if (status === 'absent') studentMap[studentId].absent++;
          else if (status === 'late') studentMap[studentId].late++;
        }
      });

      let grandTotalDays = 0;
      let grandPresent = 0;
      let grandAbsent = 0;
      let grandLate = 0;

      const studentSummaries = students.map((std) => {
        const stats = studentMap[std.id];
        const attended = stats.present + stats.late;
        const percentage = stats.total > 0 ? Math.round((attended / stats.total) * 100) : 0;

        grandTotalDays += stats.total;
        grandPresent += stats.present;
        grandAbsent += stats.absent;
        grandLate += stats.late;

        return {
          studentId: std.id,
          studentName: std.name,
          rollNumber: std.rollNumber,
          totalDays: stats.total,
          presentCount: stats.present,
          absentCount: stats.absent,
          lateCount: stats.late,
          earlyOffCount: 0,
          festivalCount: 0,
          percentage,
        };
      });

      const averageAttendanceRate = grandTotalDays > 0 
        ? Math.round(((grandPresent + grandLate) / grandTotalDays) * 100) 
        : 0;

      const uniqueDates = new Set(records.map((r: any) => r.date));

      return {
        classId,
        className: 'Class Roster',
        totalStudents: students.length,
        averageAttendanceRate,
        totalSessions: uniqueDates.size,
        presentRate: grandTotalDays > 0 ? Math.round((grandPresent / grandTotalDays) * 100) : 0,
        absentRate: grandTotalDays > 0 ? Math.round((grandAbsent / grandTotalDays) * 100) : 0,
        lateRate: grandTotalDays > 0 ? Math.round((grandLate / grandTotalDays) * 100) : 0,
        earlyOffRate: 0,
        festivalRate: 0,
        studentSummaries: studentSummaries.sort((a, b) => a.percentage - b.percentage),
      };
    } catch (error) {
      console.error('Error generating attendance report:', error);
      return {
        classId,
        className: 'Class Roster',
        totalStudents: 0,
        averageAttendanceRate: 0,
        totalSessions: 0,
        presentRate: 0,
        absentRate: 0,
        lateRate: 0,
        earlyOffRate: 0,
        festivalRate: 0,
        studentSummaries: [],
      };
    }
  },
};

export default attendanceApi;
