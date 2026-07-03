// TODO: Change the import path if exam.ts is moved.
import {
  Student,
  MarksPayload,
} from '../types/exam';

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

const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/*
 * TODO:
 * Replace this in-memory database with backend API calls.
 */
let RESULTS_DB: ExamResult[] = [];

const STUDENTS_DB: Record<string, Student[]> = {
  c1: [
    {
      id: '101',
      name: 'Lucas Henry',
      rollNo: '08C01',
      classId: 'c1',
    },
    {
      id: '102',
      name: 'Sofia Morales',
      rollNo: '08C02',
      classId: 'c1',
    },
    {
      id: '103',
      name: 'Henry Conaway',
      rollNo: '08C03',
      classId: 'c1',
    },
  ],

  c2: [
    {
      id: '201',
      name: 'Aditya Das',
      rollNo: '10B01',
      classId: 'c2',
    },
    {
      id: '202',
      name: 'Bhavna Roy',
      rollNo: '10B02',
      classId: 'c2',
    },
  ],
};

export const ExamService = {
  async getStudentsByClass(
    classId: string
  ): Promise<Student[]> {
    await delay(250);

    return STUDENTS_DB[classId]
      ? [...STUDENTS_DB[classId]]
      : [];
  },

  async uploadMarks(
    payload: MarksPayload
  ): Promise<ExamResult> {
    await delay(300);

    const result: ExamResult = {
      id: Date.now().toString(),

      studentId: payload.studentId,
      classId: payload.classId,
      subject: payload.subject,
      examType: payload.examType,

      marks: payload.marks,
      maxMarks: payload.maxMarks,
      passingMarks: payload.passingMarks,

      status:
        payload.marks >= payload.passingMarks
          ? 'pass'
          : 'fail',
    };

    RESULTS_DB.push(result);

    return result;
  },

  async updateMarks(
    resultId: string,
    payload: MarksPayload
  ): Promise<ExamResult> {
    await delay(300);

    const index = RESULTS_DB.findIndex(
      (item) => item.id === resultId
    );

    if (index === -1) {
      throw new Error('Result not found');
    }

    RESULTS_DB[index] = {
      ...RESULTS_DB[index],

      marks: payload.marks,
      maxMarks: payload.maxMarks,
      passingMarks: payload.passingMarks,

      status:
        payload.marks >= payload.passingMarks
          ? 'pass'
          : 'fail',
    };

    return RESULTS_DB[index];
  },

  async getStudentResults(
    studentId: string
  ): Promise<ExamResult[]> {
    await delay(250);

    return RESULTS_DB.filter(
      (result) => result.studentId === studentId
    );
  },

  async getResultsByClass(
    classId: string
  ): Promise<ExamResult[]> {
    await delay(250);

    return RESULTS_DB.filter(
      (result) => result.classId === classId
    );
  },
};

export default ExamService;