export interface Student {
  id: string;
  name: string;
  rollNo: string; // TODO: Change to rollNumber if backend uses rollNumber
  classId: string;
}

export interface SubjectResult {
  id: string;
  subject: string;
  marks: number;
  maxMarks: number;
  passingMarks: number;
  grade?: string;
  status: "pass" | "fail";
}

export interface ExamInfo {
  id: string;
  name: string;
  academicYear: string;
}

export interface ResultSummary {
  totalSubjects: number;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  passedSubjects: number;
  failedSubjects: number;
}

export interface StudentResult {
  student: Student;
  exam: ExamInfo;
  subjects: SubjectResult[];
  summary: ResultSummary;
}

export interface MarksRowState {
  studentId: string;
  marks: string;
  error: string | null;
  isExisting: boolean;
  resultId?: string;
}

export interface MarksPayload {
  studentId: string;
  classId: string;
  subject: string;
  examType: string;
  marks: number;
  maxMarks: number;
  passingMarks: number;
}

export interface FilterOption {
  id: string;
  label: string;
}