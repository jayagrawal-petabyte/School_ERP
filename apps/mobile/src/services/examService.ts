import {
  Student,
  MarksPayload,
  StudentResult,
  SubjectResult,
} from '../types/exam';
import { API_CONFIG, getAuthHeaders } from '../config/apiConfig';

export interface ExamResult {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  examType: string;
  marks: number;
  maxMarks: number;
  passingMarks: number;
  status: 'pass' | 'fail';
}

const calculateGrade = (marks: number) => {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
};

export const ExamService = {
  async getStudentsByClass(classId: string): Promise<Student[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/attendance/students?classId=${classId}`, { method: 'GET', headers });
      if (!response.ok) return [];
      const result = await response.json();
      return (result.data || []).map((s: any) => ({
        id: s.id,
        name: s.fullName || s.full_name || 'Unnamed Student',
        rollNo: s.rollNumber || s.roll_number || (s.id ? s.id.split('-').pop().toUpperCase().replace(/^0+/, '') || s.id.substring(0, 6) : 'N/A'),
        classId
      }));
    } catch (error) {
      console.error('Error fetching students for exams:', error);
      return [];
    }
  },

  async uploadMarks(payload: MarksPayload): Promise<ExamResult | null> {
    try {
      const headers = await getAuthHeaders();
      const mappedPayload = {
        studentId: payload.studentId,
        classId: payload.classId,
        examId: payload.examType, // contains examId UUID
        subject: payload.subject, // contains subjectId UUID
        marks_obtained: payload.marks,
        max_marks: payload.maxMarks,
        passing_marks: payload.passingMarks
      };
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/exams`, {
        method: 'POST',
        headers,
        body: JSON.stringify(mappedPayload),
      });
      if (!response.ok) throw new Error('Failed to upload marks');
      const result = await response.json();
      return result.data as ExamResult;
    } catch (error) {
      console.error('Error uploading marks:', error);
      return null;
    }
  },

  async updateMarks(resultId: string, payload: MarksPayload): Promise<ExamResult | null> {
    try {
      const headers = await getAuthHeaders();
      const mappedPayload = {
        studentId: payload.studentId,
        classId: payload.classId,
        examId: payload.examType, // contains examId UUID
        subject: payload.subject, // contains subjectId UUID
        marks_obtained: payload.marks,
        max_marks: payload.maxMarks,
        passing_marks: payload.passingMarks
      };
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/exams/${resultId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(mappedPayload),
      });
      if (!response.ok) throw new Error('Failed to update marks');
      const result = await response.json();
      return result.data as ExamResult;
    } catch (error) {
      console.error('Error updating marks:', error);
      return null;
    }
  },

  async getStudentResults(studentId: string): Promise<StudentResult[] | null> {
    try {
      const { getToken } = await import('../utils/security');
      const savedRole = await getToken('user_role');
      
      const headers = await getAuthHeaders();
      const url = savedRole === 'student'
        ? `${API_CONFIG.BASE_URL}/api/exams/me?limit=100`
        : `${API_CONFIG.BASE_URL}/api/exams?studentId=${studentId}&limit=100`;

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) return null;
      const result = await response.json();
      const marksList = result.data || [];
      
      // Group by examId
      const grouped: { [examId: string]: any[] } = {};
      for (const m of marksList) {
        const examId = m.examId || 'unknown';
        if (!grouped[examId]) grouped[examId] = [];
        grouped[examId].push(m);
      }

      const studentResults: StudentResult[] = [];

      for (const examId of Object.keys(grouped)) {
        const list = grouped[examId];
        if (list.length === 0) continue;
        
        const first = list[0];
        const studentInfo: Student = {
          id: studentId,
          name: first.studentName || 'Student',
          rollNo:
studentId.split('-').pop()?.toUpperCase().replace(/^0+/, '') ??
studentId.substring(0,6),
          classId: first.classId || ''
        };

        const examInfo = {
          id: examId,
          name: first.examMeta?.name || 'Examination',
          academicYear: first.examMeta?.academic_year || '2026-2027'
        };

        const subjects: SubjectResult[] = list.map((m: any) => ({
          id: m.id,
          subjectId: m.subjectId,
          subject: m.subjectMeta?.name || 'Subject',
          subjectName: m.subjectMeta?.name || 'Subject',
          marks: m.marksObtained || 0,
          marksObtained: m.marksObtained || 0,
          maxMarks: m.maxMarks || 100,
          passingMarks: m.passingMarks || 35,
          grade: calculateGrade(m.marksObtained || 0),
          status: m.status || 'pass'
        }));

        const totalObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
        const totalMax = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
        const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;

        const summary = {
          totalSubjects: subjects.length,
          obtainedMarks: totalObtained,
          totalMarks: totalMax,
          percentage,
          passedSubjects: subjects.filter(s => s.status === 'pass').length,
          failedSubjects: subjects.filter(s => s.status === 'fail').length,
        };

        studentResults.push({
          student: studentInfo,
          exam: examInfo,
          subjects,
          summary,
          remarks: percentage >= 50 ? 'Good progress. Keep it up!' : 'Needs improvement.',
          grade: calculateGrade(percentage)
        });
      }

      return studentResults;
    } catch (error) {
      console.error('Error fetching student results:', error);
      return null;
    }
  },

  async getResultsByClass(classId: string): Promise<ExamResult[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/exams?classId=${classId}&limit=100`, { method: 'GET', headers });
      if (!response.ok) return [];
      const result = await response.json();
      return (result.data || []).map((m: any) => ({
        id: m.id,
        studentId: m.studentId,
        classId: m.classId,
        subject: m.subjectMeta?.name || 'Subject',
        examType: m.examMeta?.name || 'Examination',
        marks: m.marksObtained || 0,
        maxMarks: m.maxMarks || 100,
        passingMarks: m.passingMarks || 35,
        status: m.status || 'pass'
      }));
    } catch (error) {
      console.error('Error fetching results by class:', error);
      return [];
    }
  },
};

export default ExamService;