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
    { id: '101', name: 'Lucas Henry', rollNo: '08C01', classId: 'c1' },
    { id: '102', name: 'Sofia Morales', rollNo: '08C02', classId: 'c1' },
    { id: '103', name: 'Henry Conaway', rollNo: '08C03', classId: 'c1' },
    { id: '104', name: 'Emma Wilson', rollNo: '08C04', classId: 'c1' },
    { id: '105', name: 'Liam Anderson', rollNo: '08C05', classId: 'c1' },
    { id: '106', name: 'Olivia Thomas', rollNo: '08C06', classId: 'c1' },
    { id: '107', name: 'Noah Martin', rollNo: '08C07', classId: 'c1' },
    { id: '108', name: 'Ava Jackson', rollNo: '08C08', classId: 'c1' },
    { id: '109', name: 'Ethan White', rollNo: '08C09', classId: 'c1' },
    { id: '110', name: 'Mia Harris', rollNo: '08C10', classId: 'c1' },
    { id: '111', name: 'James Lewis', rollNo: '08C11', classId: 'c1' },
    { id: '112', name: 'Charlotte Hall', rollNo: '08C12', classId: 'c1' },
    { id: '113', name: 'Benjamin Allen', rollNo: '08C13', classId: 'c1' },
    { id: '114', name: 'Amelia Young', rollNo: '08C14', classId: 'c1' },
    { id: '115', name: 'Daniel King', rollNo: '08C15', classId: 'c1' },
    { id: '116', name: 'Harper Scott', rollNo: '08C16', classId: 'c1' },
    { id: '117', name: 'Logan Green', rollNo: '08C17', classId: 'c1' },
    { id: '118', name: 'Ella Baker', rollNo: '08C18', classId: 'c1' },
    { id: '119', name: 'Matthew Nelson', rollNo: '08C19', classId: 'c1' },
    { id: '120', name: 'Grace Carter', rollNo: '08C20', classId: 'c1' },
  ],

  c2: [
    { id: '201', name: 'Aditya Das', rollNo: '10B01', classId: 'c2' },
    { id: '202', name: 'Bhavna Roy', rollNo: '10B02', classId: 'c2' },
    { id: '203', name: 'Rahul Mehta', rollNo: '10B03', classId: 'c2' },
    { id: '204', name: 'Sneha Kapoor', rollNo: '10B04', classId: 'c2' },
    { id: '205', name: 'Aryan Sharma', rollNo: '10B05', classId: 'c2' },
    { id: '206', name: 'Priya Verma', rollNo: '10B06', classId: 'c2' },
    { id: '207', name: 'Rohan Gupta', rollNo: '10B07', classId: 'c2' },
    { id: '208', name: 'Ananya Singh', rollNo: '10B08', classId: 'c2' },
    { id: '209', name: 'Karan Joshi', rollNo: '10B09', classId: 'c2' },
    { id: '210', name: 'Ishita Nair', rollNo: '10B10', classId: 'c2' },
    { id: '211', name: 'Vivaan Patel', rollNo: '10B11', classId: 'c2' },
    { id: '212', name: 'Diya Rao', rollNo: '10B12', classId: 'c2' },
    { id: '213', name: 'Arjun Iyer', rollNo: '10B13', classId: 'c2' },
    { id: '214', name: 'Meera Pillai', rollNo: '10B14', classId: 'c2' },
    { id: '215', name: 'Kabir Malhotra', rollNo: '10B15', classId: 'c2' },
    { id: '216', name: 'Nisha Reddy', rollNo: '10B16', classId: 'c2' },
    { id: '217', name: 'Yash Jain', rollNo: '10B17', classId: 'c2' },
    { id: '218', name: 'Tanvi Bansal', rollNo: '10B18', classId: 'c2' },
    { id: '219', name: 'Harsh Vyas', rollNo: '10B19', classId: 'c2' },
    { id: '220', name: 'Pooja Kulkarni', rollNo: '10B20', classId: 'c2' },
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