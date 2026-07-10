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

export const ExamService = {
  async getStudentsByClass(classId: string): Promise<Student[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/students?classId=${classId}`, { method: 'GET', headers });
      if (!response.ok) return [];
      const result = await response.json();
      return (result.data || []).map((s: any) => ({
        id: s.id,
        name: s.fullName,
        rollNo: s.rollNumber || 'N/A',
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/exams/marks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/exams/marks/${resultId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update marks');
      const result = await response.json();
      return result.data as ExamResult;
    } catch (error) {
      console.error('Error updating marks:', error);
      return null;
    }
  },

  async getStudentResults(studentId: string): Promise<StudentResult | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/exams/results/student/${studentId}`, { method: 'GET', headers });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data as StudentResult;
    } catch (error) {
      console.error('Error fetching student results:', error);
      return null;
    }
  },

  async getResultsByClass(classId: string): Promise<ExamResult[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/exams/results/class/${classId}`, { method: 'GET', headers });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data as ExamResult[];
    } catch (error) {
      console.error('Error fetching results by class:', error);
      return [];
    }
  },
};

export default ExamService;