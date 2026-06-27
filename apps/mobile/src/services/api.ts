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

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface DailyAttendance {
  classId: string;
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
}

export interface StudentHistoryRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

// In-Memory Database
const CLASSES: ClassInfo[] = [
  { id: '1', name: 'Class 10', section: 'A', studentCount: 15 },
  { id: '2', name: 'Class 10', section: 'B', studentCount: 12 },
  { id: '3', name: 'Class 11', section: 'Science-A', studentCount: 10 },
  { id: '4', name: 'Class 12', section: 'Commerce-B', studentCount: 10 },
];

const STUDENTS: Record<string, Student[]> = {
  '1': [
    { id: '101', name: 'Aarav Sharma', rollNumber: '10A01', gender: 'M' },
    { id: '102', name: 'Ananya Iyer', rollNumber: '10A02', gender: 'F' },
    { id: '103', name: 'Arjun Verma', rollNumber: '10A03', gender: 'M' },
    { id: '104', name: 'Diya Patel', rollNumber: '10A04', gender: 'F' },
    { id: '105', name: 'Ishaan Gupta', rollNumber: '10A05', gender: 'M' },
    { id: '106', name: 'Kavya Nair', rollNumber: '10A06', gender: 'F' },
    { id: '107', name: 'Kabir Singh', rollNumber: '10A07', gender: 'M' },
    { id: '108', name: 'Meera Reddy', rollNumber: '10A08', gender: 'F' },
    { id: '109', name: 'Pranav Joshi', rollNumber: '10A09', gender: 'M' },
    { id: '110', name: 'Riya Sen', rollNumber: '10A10', gender: 'F' },
    { id: '111', name: 'Rohan Mehta', rollNumber: '10A11', gender: 'M' },
    { id: '112', name: 'Sanya Malhotra', rollNumber: '10A12', gender: 'F' },
    { id: '113', name: 'Siddharth Rao', rollNumber: '10A13', gender: 'M' },
    { id: '114', name: 'Tanvi Bhatia', rollNumber: '10A14', gender: 'F' },
    { id: '115', name: 'Vivaan Kapoor', rollNumber: '10A15', gender: 'M' },
  ],
  '2': [
    { id: '201', name: 'Aditya Das', rollNumber: '10B01', gender: 'M' },
    { id: '202', name: 'Bhavna Roy', rollNumber: '10B02', gender: 'F' },
    { id: '203', name: 'Devendra Pandey', rollNumber: '10B03', gender: 'M' },
    { id: '204', name: 'Esha Deol', rollNumber: '10B04', gender: 'F' },
    { id: '205', name: 'Gaurav Gill', rollNumber: '10B05', gender: 'M' },
    { id: '206', name: 'Harsha Vardhan', rollNumber: '10B06', gender: 'M' },
    { id: '207', name: 'Ipshita Mishra', rollNumber: '10B07', gender: 'F' },
    { id: '208', name: 'Jayesh Vyas', rollNumber: '10B08', gender: 'M' },
    { id: '209', name: 'Komal Preet', rollNumber: '10B09', gender: 'F' },
    { id: '210', name: 'Manish Pandey', rollNumber: '10B10', gender: 'M' },
    { id: '211', name: 'Neha Kakkar', rollNumber: '10B11', gender: 'F' },
    { id: '212', name: 'Piyush Goyal', rollNumber: '10B12', gender: 'M' },
  ],
  '3': [
    { id: '301', name: 'Abhishek Bachchan', rollNumber: '11S01', gender: 'M' },
    { id: '302', name: 'Deepika Padukone', rollNumber: '11S02', gender: 'F' },
    { id: '303', name: 'Hrithik Roshan', rollNumber: '11S03', gender: 'M' },
    { id: '304', name: 'Katrina Kaif', rollNumber: '11S04', gender: 'F' },
    { id: '305', name: 'Ranbir Kapoor', rollNumber: '11S05', gender: 'M' },
    { id: '306', name: 'Alia Bhatt', rollNumber: '11S06', gender: 'F' },
    { id: '307', name: 'Varun Dhawan', rollNumber: '11S07', gender: 'M' },
    { id: '308', name: 'Shraddha Kapoor', rollNumber: '11S08', gender: 'F' },
    { id: '309', name: 'Sidharth Malhotra', rollNumber: '11S09', gender: 'M' },
    { id: '310', name: 'Kiara Advani', rollNumber: '11S10', gender: 'F' },
  ],
  '4': [
    { id: '401', name: 'Karan Johar', rollNumber: '12C01', gender: 'M' },
    { id: '402', name: 'Ekta Kapoor', rollNumber: '12C02', gender: 'F' },
    { id: '403', name: 'Sanjay Leela', rollNumber: '12C03', gender: 'M' },
    { id: '404', name: 'Zoya Akhtar', rollNumber: '12C04', gender: 'F' },
    { id: '405', name: 'Farhan Akhtar', rollNumber: '12C05', gender: 'M' },
    { id: '406', name: 'Reema Kagti', rollNumber: '12C06', gender: 'F' },
    { id: '407', name: 'Anurag Kashyap', rollNumber: '12C07', gender: 'M' },
    { id: '408', name: 'Guneet Monga', rollNumber: '12C08', gender: 'F' },
    { id: '409', name: 'Rohit Shetty', rollNumber: '12C09', gender: 'M' },
    { id: '410', name: 'Farah Khan', rollNumber: '12C10', gender: 'F' },
  ],
};

// Generate 14 days of historical attendance
const generateMockHistory = (): DailyAttendance[] => {
  const history: DailyAttendance[] = [];
  const today = new Date();

  // Populate for last 14 days (excluding Sundays)
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Skip Sunday (0)
    if (date.getDay() === 0) continue;

    const dateStr = date.toISOString().split('T')[0];

    CLASSES.forEach((cls) => {
      const students = STUDENTS[cls.id] || [];
      const records: AttendanceRecord[] = students.map((std, index) => {
        // Deterministic status based on indices to create realistic patterns
        const rand = (index * 7 + i * 13) % 100;
        let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
        
        if (rand < 8) {
          status = 'absent';
        } else if (rand < 14) {
          status = 'late';
        } else if (rand < 16) {
          status = 'excused';
        }

        return {
          studentId: std.id,
          status,
          remarks: status !== 'present' ? `Notes for day -${i}` : undefined,
        };
      });

      history.push({
        classId: cls.id,
        date: dateStr,
        records,
      });
    });
  }

  return history;
};

// Active database in memory
let ATTENDANCE_DB: DailyAttendance[] = generateMockHistory();

// Helper to delay response for realistic network feel
const delay = (ms: number = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const AttendanceService = {
  // Fetch list of classes
  getClasses: async (): Promise<ClassInfo[]> => {
    await delay(300);
    return [...CLASSES];
  },

  // Fetch student roster for a class
  getStudents: async (classId: string): Promise<Student[]> => {
    await delay(300);
    return STUDENTS[classId] ? [...STUDENTS[classId]] : [];
  },

  // Submit/mark daily attendance for a class
  submitAttendance: async (
    classId: string,
    date: string,
    records: AttendanceRecord[]
  ): Promise<{ success: boolean; message: string }> => {
    await delay(500);

    // Remove existing entry for the same class and date if it exists
    ATTENDANCE_DB = ATTENDANCE_DB.filter(
      (entry) => !(entry.classId === classId && entry.date === date)
    );

    // Add new entry
    ATTENDANCE_DB.push({
      classId,
      date,
      records: JSON.parse(JSON.stringify(records)), // Deep clone
    });

    return { success: true, message: 'Attendance submitted successfully.' };
  },

  // Fetch attendance records for a class on a specific date
  getAttendanceByDate: async (classId: string, date: string): Promise<AttendanceRecord[] | null> => {
    await delay(200);
    const found = ATTENDANCE_DB.find((entry) => entry.classId === classId && entry.date === date);
    return found ? found.records : null;
  },

  // Fetch logs of attendance dates for history screens
  getClassAttendanceHistory: async (classId: string): Promise<DailyAttendance[]> => {
    await delay(400);
    // Sort history by date descending
    return ATTENDANCE_DB.filter((entry) => entry.classId === classId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  // Fetch summary reports
  getAttendanceReport: async (
    classId: string
  ): Promise<{
    classId: string;
    className: string;
    totalStudents: number;
    averageAttendanceRate: number; // percentage
    totalSessions: number;
    presentRate: number;
    absentRate: number;
    lateRate: number;
    excusedRate: number;
    studentSummaries: {
      studentId: string;
      studentName: string;
      rollNumber: string;
      totalDays: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      excusedCount: number;
      percentage: number;
    }[];
  }> => {
    await delay(500);
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
        excusedRate: 0,
        studentSummaries: students.map((std) => ({
          studentId: std.id,
          studentName: std.name,
          rollNumber: std.rollNumber,
          totalDays: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          excusedCount: 0,
          percentage: 0,
        })),
      };
    }

    let grandTotalDays = 0;
    let grandPresentCount = 0;
    let grandAbsentCount = 0;
    let grandLateCount = 0;
    let grandExcusedCount = 0;

    const studentSummaries = students.map((std) => {
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      classRecords.forEach((session) => {
        const rec = session.records.find((r) => r.studentId === std.id);
        if (rec) {
          if (rec.status === 'present') presentCount++;
          else if (rec.status === 'absent') absentCount++;
          else if (rec.status === 'late') lateCount++;
          else if (rec.status === 'excused') excusedCount++;
        }
      });

      const totalDays = presentCount + absentCount + lateCount + excusedCount;
      // Late is considered partially present (e.g. 100% or 90% depending on rule, let's treat late as present for percentage but track count)
      const presentWeight = presentCount + lateCount;
      const percentage = totalDays > 0 ? Math.round((presentWeight / totalDays) * 100) : 0;

      grandTotalDays += totalDays;
      grandPresentCount += presentCount;
      grandAbsentCount += absentCount;
      grandLateCount += lateCount;
      grandExcusedCount += excusedCount;

      return {
        studentId: std.id,
        studentName: std.name,
        rollNumber: std.rollNumber,
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        percentage,
      };
    });

    const averageAttendanceRate =
      grandTotalDays > 0 ? Math.round(((grandPresentCount + grandLateCount) / grandTotalDays) * 100) : 0;

    return {
      classId,
      className: `${cls.name}-${cls.section}`,
      totalStudents: students.length,
      averageAttendanceRate,
      totalSessions,
      presentRate: grandTotalDays > 0 ? Math.round((grandPresentCount / grandTotalDays) * 100) : 0,
      absentRate: grandTotalDays > 0 ? Math.round((grandAbsentCount / grandTotalDays) * 100) : 0,
      lateRate: grandTotalDays > 0 ? Math.round((grandLateCount / grandTotalDays) * 100) : 0,
      excusedRate: grandTotalDays > 0 ? Math.round((grandExcusedCount / grandTotalDays) * 100) : 0,
      studentSummaries: studentSummaries.sort((a, b) => a.percentage - b.percentage), // ascending percentage to highlight low attendance students
    };
  },
};
