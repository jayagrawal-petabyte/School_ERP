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

// In-Memory Database of Students (matching screenshots names)
const STUDENTS: Record<string, Student[]> = {
  '1': [
    { id: '101', name: 'Lucas Henry', rollNumber: '08C01', gender: 'M' },
    { id: '102', name: 'Sofia Morales', rollNumber: '08C02', gender: 'F' },
    { id: '103', name: 'Henry Conaway', rollNumber: '08C03', gender: 'M' },
    { id: '104', name: 'Daniel Rowell', rollNumber: '08C04', gender: 'M' },
    { id: '105', name: 'Aarav Sharma', rollNumber: '08C05', gender: 'M' },
    { id: '106', name: 'Ananya Iyer', rollNumber: '08C06', gender: 'F' },
    { id: '107', name: 'Ishaan Gupta', rollNumber: '08C07', gender: 'M' },
    { id: '108', name: 'Kavya Nair', rollNumber: '08C08', gender: 'F' },
    { id: '109', name: 'Kabir Singh', rollNumber: '08C09', gender: 'M' },
    { id: '110', name: 'Meera Reddy', rollNumber: '08C10', gender: 'F' },
    { id: '111', name: 'Siddharth Rao', rollNumber: '08C11', gender: 'M' },
    { id: '112', name: 'Tanvi Bhatia', rollNumber: '08C12', gender: 'F' },
  ],
  '2': [
    { id: '201', name: 'Aditya Das', rollNumber: '10B01', gender: 'M' },
    { id: '202', name: 'Bhavna Roy', rollNumber: '10B02', gender: 'F' },
    { id: '203', name: 'Devendra Pandey', rollNumber: '10B03', gender: 'M' },
    { id: '204', name: 'Esha Deol', rollNumber: '10B04', gender: 'F' },
  ],
};

const CLASSES: ClassInfo[] = [
  { id: '1', name: 'Standard - 8', section: 'C', studentCount: 12 },
  { id: '2', name: 'Standard - 10', section: 'B', studentCount: 4 },
];

// Prepopulated static history for Lucas Henry (101) in May 2023 to match Dribbble screenshot exactly
const LUCAS_HENRY_MAY_2023: Record<number, AttendanceStatus> = {
  1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present',
  7: 'present', 8: 'earlyOff', 9: 'present', 10: 'present', 11: 'absent', 12: 'present',
  14: 'present', 15: 'present', 16: 'festival',
  21: 'present', 22: 'present', 23: 'present', 24: 'late', 25: 'present', 26: 'festival',
  28: 'absent', 29: 'present', 30: 'present', 31: 'present'
};

// Generate randomized mock history for other days/students
const generateMockHistory = (): DailyAttendance[] => {
  const history: DailyAttendance[] = [];
  
  // 1. First populate the specific May 2023 history for Class 1 (Standard 8 - C)
  for (let day = 1; day <= 31; day++) {
    const dateStr = `2023-05-${day.toString().padStart(2, '0')}`;
    const students = STUDENTS['1'];
    
    const records: AttendanceRecord[] = students.map((std) => {
      let status: AttendanceStatus = 'present';
      
      if (std.id === '101') {
        // Lucas Henry gets the exact dribbble calendar values
        status = LUCAS_HENRY_MAY_2023[day] || 'present';
      } else {
        // Others get random statuses
        const rand = (std.id.charCodeAt(2) * 3 + day * 7) % 100;
        if (rand < 5) status = 'absent';
        else if (rand < 10) status = 'late';
        else if (rand < 13) status = 'earlyOff';
        else if (rand < 15) status = 'festival';
      }

      return { studentId: std.id, status };
    });

    history.push({
      classId: '1',
      date: dateStr,
      records
    });
  }

  // 2. Add some recent history for class 1 and class 2 (last 7 days from today)
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    if (date.getDay() === 0) continue; // skip sundays
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip if it clashes with May 2023 (unlikely but safe)
    if (dateStr.startsWith('2023-05-')) continue;

    CLASSES.forEach((cls) => {
      const students = STUDENTS[cls.id] || [];
      const records: AttendanceRecord[] = students.map((std, idx) => {
        const rand = (idx * 11 + i * 17) % 100;
        let status: AttendanceStatus = 'present';
        if (rand < 8) status = 'absent';
        else if (rand < 14) status = 'late';
        else if (rand < 18) status = 'earlyOff';
        
        return { studentId: std.id, status };
      });

      history.push({
        classId: cls.id,
        date: dateStr,
        records
      });
    });
  }

  return history;
};

let ATTENDANCE_DB: DailyAttendance[] = generateMockHistory();
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const AttendanceService = {
  getClasses: async (): Promise<ClassInfo[]> => {
    await delay(200);
    return [...CLASSES];
  },

  getStudents: async (classId: string): Promise<Student[]> => {
    await delay(200);
    return STUDENTS[classId] ? [...STUDENTS[classId]] : [];
  },

  submitAttendance: async (
    classId: string,
    date: string,
    records: AttendanceRecord[]
  ): Promise<{ success: boolean; message: string }> => {
    await delay(300);

    ATTENDANCE_DB = ATTENDANCE_DB.filter(
      (entry) => !(entry.classId === classId && entry.date === date)
    );

    ATTENDANCE_DB.push({
      classId,
      date,
      records: JSON.parse(JSON.stringify(records)),
    });

    return { success: true, message: 'Attendance submitted successfully.' };
  },

  getAttendanceByDate: async (classId: string, date: string): Promise<AttendanceRecord[] | null> => {
    await delay(150);
    const found = ATTENDANCE_DB.find((entry) => entry.classId === classId && entry.date === date);
    return found ? found.records : null;
  },

  getClassAttendanceHistory: async (classId: string): Promise<DailyAttendance[]> => {
    await delay(200);
    return ATTENDANCE_DB.filter((entry) => entry.classId === classId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  // Search a student by name and return their attendance records for a specific year and month
  getStudentMonthlyAttendance: async (
    studentName: string,
    classId: string,
    year: number,
    month: number
  ): Promise<StudentHistoryRecord[]> => {
    await delay(450);
    
    // Find student ID
    const classStudents = STUDENTS[classId] || [];
    const student = classStudents.find((s) => s.name.toLowerCase().includes(studentName.toLowerCase()));
    
    if (!student) {
      return [];
    }

    const monthPrefix = `${year}-${month.toString().padStart(2, '0')}-`;
    
    // Filter database for records belonging to this student in this month
    const studentRecords: StudentHistoryRecord[] = [];
    
    ATTENDANCE_DB.forEach((session) => {
      if (session.classId === classId && session.date.startsWith(monthPrefix)) {
        const studentRec = session.records.find((r) => r.studentId === student.id);
        if (studentRec) {
          studentRecords.push({
            date: session.date,
            status: studentRec.status,
          });
        }
      }
    });

    return studentRecords;
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
    await delay(350);
    const cls = CLASSES.find((c) => c.id === classId);
    if (!cls) throw new Error('Class not found');

    const students = STUDENTS[classId] || [];
    const classRecords = ATTENDANCE_DB.filter((entry) => entry.classId === classId);
    const totalSessions = classRecords.length;

    if (totalSessions === 0) {
      return {
        classId,
        className: `${cls.name}-${cls.section}`,
        totalStudents: students.length,
        averageAttendanceRate: 0,
        totalSessions: 0,
        presentRate: 0,
        absentRate: 0,
        lateRate: 0,
        earlyOffRate: 0,
        festivalRate: 0,
        studentSummaries: students.map((std) => ({
          studentId: std.id,
          studentName: std.name,
          rollNumber: std.rollNumber,
          totalDays: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          earlyOffCount: 0,
          festivalCount: 0,
          percentage: 0,
        })),
      };
    }

    let grandTotalDays = 0;
    let grandPresentCount = 0;
    let grandAbsentCount = 0;
    let grandLateCount = 0;
    let grandEarlyOffCount = 0;
    let grandFestivalCount = 0;

    const studentSummaries = students.map((std) => {
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let earlyOffCount = 0;
      let festivalCount = 0;

      classRecords.forEach((session) => {
        const rec = session.records.find((r) => r.studentId === std.id);
        if (rec) {
          if (rec.status === 'present') presentCount++;
          else if (rec.status === 'absent') absentCount++;
          else if (rec.status === 'late') lateCount++;
          else if (rec.status === 'earlyOff') earlyOffCount++;
          else if (rec.status === 'festival') festivalCount++;
        }
      });

      const totalDays = presentCount + absentCount + lateCount + earlyOffCount + festivalCount;
      const attendedCount = presentCount + lateCount + earlyOffCount + festivalCount; // early off/festival are not counts of absence
      const percentage = totalDays > 0 ? Math.round((attendedCount / totalDays) * 100) : 0;

      grandTotalDays += totalDays;
      grandPresentCount += presentCount;
      grandAbsentCount += absentCount;
      grandLateCount += lateCount;
      grandEarlyOffCount += earlyOffCount;
      grandFestivalCount += festivalCount;

      return {
        studentId: std.id,
        studentName: std.name,
        rollNumber: std.rollNumber,
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        earlyOffCount,
        festivalCount,
        percentage,
      };
    });

    const averageAttendanceRate =
      grandTotalDays > 0
        ? Math.round(
            ((grandPresentCount + grandLateCount + grandEarlyOffCount + grandFestivalCount) /
              grandTotalDays) *
              100
          )
        : 0;

    return {
      classId,
      className: `${cls.name}-${cls.section}`,
      totalStudents: students.length,
      averageAttendanceRate,
      totalSessions,
      presentRate: grandTotalDays > 0 ? Math.round((grandPresentCount / grandTotalDays) * 100) : 0,
      absentRate: grandTotalDays > 0 ? Math.round((grandAbsentCount / grandTotalDays) * 100) : 0,
      lateRate: grandTotalDays > 0 ? Math.round((grandLateCount / grandTotalDays) * 100) : 0,
      earlyOffRate: grandTotalDays > 0 ? Math.round((grandEarlyOffCount / grandTotalDays) * 100) : 0,
      festivalRate: grandTotalDays > 0 ? Math.round((grandFestivalCount / grandTotalDays) * 100) : 0,
      studentSummaries: studentSummaries.sort((a, b) => a.percentage - b.percentage),
    };
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
  status: 'pending' | 'submitted' | 'graded';
  obtainedMarks?: number;
  feedback?: string;
  attachmentUrl?: string;
  submission?: {
    submittedAt: string;
    notes: string;
    fileName: string;
  };
}

const ASSIGNMENTS_DB: Assignment[] = [
  {
    id: 'a1',
    classId: '1',
    title: 'Algebra and Quadratic Equations',
    subject: 'Mathematics',
    description: 'Solve exercises 1 to 10 on page 143 of your Math textbook. Write down the detailed step-by-step proofs for questions 5 and 7 on a blank sheet, scan it as a PDF, and attach it to your submission.',
    dueDate: '2026-07-10',
    maxMarks: 100,
    assignedBy: 'Mrs. Shradha Sen',
    status: 'pending',
  },
  {
    id: 'a2',
    classId: '1',
    title: 'Newtonian Mechanics Lab Report',
    subject: 'Physics',
    description: 'Write a detailed lab report for the Pendulum experiment conducted last week. Include your observations table, error analysis graph, and answer all questions in the experimental manual.',
    dueDate: '2026-07-08',
    maxMarks: 50,
    assignedBy: 'Mr. Rajesh Rawat',
    status: 'submitted',
    submission: {
      submittedAt: '2026-07-01 10:30 AM',
      notes: 'I have attached the graph image along with the laboratory observations sheet.',
      fileName: 'Physics_Lab_Report_Sofia.pdf'
    }
  },
  {
    id: 'a3',
    classId: '1',
    title: 'Organic Chemistry Reactions',
    subject: 'Chemistry',
    description: 'Provide the reaction mechanisms for the electrophilic substitution reactions of benzene discussed in yesterday\'s class. Highlight the generation of the electrophile and the intermediate carbocation resonance structures.',
    dueDate: '2026-06-25',
    maxMarks: 75,
    assignedBy: 'Dr. Vivek Kumar',
    status: 'graded',
    obtainedMarks: 68,
    feedback: 'Excellent mechanism diagrams! Make sure to write the catalyst regeneration step next time.',
    submission: {
      submittedAt: '2026-06-24 04:15 PM',
      notes: 'Benzene reactions assignment.',
      fileName: 'Chemistry_Org_Sofia.pdf'
    }
  },
  {
    id: 'a4',
    classId: '1',
    title: 'Shakespeare Macbeth Character Study',
    subject: 'English Literature',
    description: 'Analyze the psychological deterioration of Macbeth from a loyal general to a tyrant. Use quotes from Act I to Act IV to support your thesis. Length should be between 800 and 1200 words.',
    dueDate: '2026-07-15',
    maxMarks: 100,
    assignedBy: 'Mrs. Priya Sharma',
    status: 'pending',
  }
];

export const AssignmentService = {
  getAssignments: async (classId: string): Promise<Assignment[]> => {
    await delay(300);
    return ASSIGNMENTS_DB.filter((a) => a.classId === classId);
  },

  getAssignmentDetails: async (assignmentId: string): Promise<Assignment | null> => {
    await delay(200);
    const assignment = ASSIGNMENTS_DB.find((a) => a.id === assignmentId);
    return assignment ? { ...assignment } : null;
  },

  submitAssignment: async (
    assignmentId: string,
    notes: string,
    fileName: string
  ): Promise<{ success: boolean; message: string }> => {
    await delay(600);
    const assignment = ASSIGNMENTS_DB.find((a) => a.id === assignmentId);
    if (!assignment) {
      return { success: false, message: 'Assignment not found' };
    }

    assignment.status = 'submitted';
    assignment.submission = {
      submittedAt: new Date().toLocaleString(),
      notes,
      fileName,
    };

    return { success: true, message: 'Assignment submitted successfully!' };
  },
};

