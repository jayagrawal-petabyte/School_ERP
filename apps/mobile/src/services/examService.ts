import {
  Student,
  MarksPayload,
  StudentResult,
  SubjectResult,
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
  ): Promise<StudentResult | null> {
    await delay(250);

    let foundStudent: Student | null = null;
    for (const classId of Object.keys(STUDENTS_DB)) {
      const match = STUDENTS_DB[classId].find((s) => s.id === studentId);
      if (match) {
        foundStudent = match;
        break;
      }
    }

    if (!foundStudent) return null;

    const subjectsList: SubjectResult[] = [
      {
        id: 's1',
        subjectId: 's1',
        subject: 'Mathematics',
        subjectName: 'Mathematics',
        marks: 88,
        marksObtained: 88,
        maxMarks: 100,
        passingMarks: 50,
        grade: 'A',
        status: 'pass'
      },
      {
        id: 's2',
        subjectId: 's2',
        subject: 'Physics',
        subjectName: 'Physics',
        marks: 74,
        marksObtained: 74,
        maxMarks: 100,
        passingMarks: 50,
        grade: 'B',
        status: 'pass'
      },
      {
        id: 's3',
        subjectId: 's3',
        subject: 'Chemistry',
        subjectName: 'Chemistry',
        marks: 45,
        marksObtained: 45,
        maxMarks: 100,
        passingMarks: 50,
        grade: 'F',
        status: 'fail'
      },
      {
        id: 's4',
        subjectId: 's4',
        subject: 'English Literature',
        subjectName: 'English Literature',
        marks: 92,
        marksObtained: 92,
        maxMarks: 100,
        passingMarks: 50,
        grade: 'A+',
        status: 'pass'
      }
    ];

    const totalMarks = subjectsList.reduce((sum, item) => sum + item.maxMarks, 0);
    const obtainedMarks = subjectsList.reduce((sum, item) => sum + item.marks, 0);
    const percentage = Number(((obtainedMarks / totalMarks) * 100).toFixed(2));
    const passedSubjects = subjectsList.filter((item) => item.status === 'pass').length;
    const failedSubjects = subjectsList.filter((item) => item.status === 'fail').length;

    return {
      student: foundStudent,
      exam: {
        id: 'e1',
        name: 'Final Term Examination',
        academicYear: '2025-2026'
      },
      subjects: subjectsList,
      summary: {
        totalSubjects: subjectsList.length,
        obtainedMarks,
        totalMarks,
        percentage,
        passedSubjects,
        failedSubjects,
        marksObtained: obtainedMarks
      },
      remarks: 'Good progress overall. Needs improvement in Chemistry.',
      grade: 'B'
    };
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