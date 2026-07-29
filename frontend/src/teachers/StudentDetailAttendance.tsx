// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { mockClassResults } from './mockData';
// import { mockTeacherAttendance } from './mockAttendanceData';
// import AttendanceDetails from './components/AttendanceDetails';
// // import AttendanceDetails from '/src/components/common/AttendanceDetails';
// //import AttendanceDetails from '../components/common/AttendanceDetails';
// // import AttendanceDetails from '../components/common/AttendanceDetails';

// const StudentDetailAttendance: React.FC = () => {
//   const { studentId } = useParams();
//   const navigate = useNavigate();

//   // Find the student's name and attendance data
//   const student = mockClassResults.find((s) => s.id === Number(studentId));
//   const attendance = mockTeacherAttendance.find((a) => a.id === Number(studentId));

//   if (!student || !attendance) {
//     return (
//       <div className="p-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="text-indigo-600 hover:underline mb-4"
//         >
//           ← Go Back
//         </button>
//         <p className="mt-4">Student or attendance record not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 text-indigo-600 hover:underline flex items-center"
//       >
//         ← Back to Class Overview
//       </button>

//       {/* This component assumes you have defined the props in AttendanceDetails.tsx 
//         as: { studentName: string; data: any; }
//       */}
//       <AttendanceDetails studentName={student.name} data={attendance} />
//     </div>
//   );
// };

// export default StudentDetailAttendance;


import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById } from '../api/studentService';
import { viewAttendance } from '../api/attendanceService';
import AttendanceDetails from './components/common/AttendanceDetails';

type StudentRecord = {
  id: string;
  name: string;
};

type AttendanceSummary = {
  overall: number;
  present: number;
  absent: number;
  late: number;
  history: Array<{ date: string; status: string }>;
};

const StudentDetailAttendance: FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudentAttendance = async () => {
      if (!studentId) {
        setError('Student record not found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [studentResponse, attendanceResponse] = await Promise.all([
          getStudentById(studentId),
          viewAttendance({ studentId }),
        ]);

        const studentData = studentResponse?.data ?? studentResponse;
        const attendanceRecords = Array.isArray(attendanceResponse)
          ? attendanceResponse
          : Array.isArray(attendanceResponse?.records)
            ? attendanceResponse.records
            : [];

        const present = attendanceRecords.filter((record: any) => String(record.status).toLowerCase() === 'present').length;
        const absent = attendanceRecords.filter((record: any) => String(record.status).toLowerCase() === 'absent').length;
        const late = attendanceRecords.filter((record: any) => String(record.status).toLowerCase() === 'late').length;
        const total = attendanceRecords.length;
        const overall = total > 0 ? Math.round((present / total) * 100) : 0;

        setStudent({
          id: String(studentData?.id ?? studentId),
          name: studentData?.name ?? `Student ${studentId}`,
        });

        setAttendance({
          overall,
          present,
          absent,
          late,
          history: attendanceRecords.map((record: any) => ({
            date: record.date ?? record.createdAt ?? record.updatedAt ?? '',
            status: record.status ?? 'Present',
          })),
        });
      } catch (fetchError) {
        console.error('Failed to load student attendance detail:', fetchError);
        setError('Student record not found.');
      } finally {
        setLoading(false);
      }
    };

    loadStudentAttendance();
  }, [studentId]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading attendance details...</div>;
  }

  if (error || !student || !attendance) {
    return <div className="p-6 text-red-500">{error || 'Student record not found.'}</div>;
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-6 text-indigo-600 hover:underline">
        ← Back to Class Overview
      </button>
      <AttendanceDetails studentName={student.name} data={attendance} />
    </div>
  );
};

export default StudentDetailAttendance;
