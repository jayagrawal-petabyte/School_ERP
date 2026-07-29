// import React, { useState } from 'react';
// import { mockClassResults } from './mockData';
// import { useNavigate } from 'react-router-dom';
// import { mockTeacherAttendance } from './mockAttendanceData';

// const TeacherAttendancePage: React.FC = () => {
//   // Combine data by ID so we have both name and attendance stats
//   const classData = mockClassResults.map(student => ({
//     ...student,
//     attendance: mockTeacherAttendance.find(a => a.id === student.id)
//   }));

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Class Attendance Overview</h1>
      
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <table className="w-full text-left">
//           <thead className="bg-gray-50 border-b">
//             <tr>
//               <th className="p-4">Roll No</th>
//               <th className="p-4">Student Name</th>
//               <th className="p-4">Overall Attendance</th>
//               <th className="p-4">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {classData.map((student) => (
//               <tr key={student.id} className="border-b hover:bg-gray-50">
//                 <td className="p-4">{student.id}</td>
//                 <td className="p-4 font-semibold">{student.name}</td>
//                 <td className="p-4">{student.attendance?.overall}%</td>
//                 <td className="p-4">
//                   <button className="text-indigo-600 font-semibold hover:underline">
//                     View Detailed Report
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TeacherAttendancePage;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../api/studentService';
import { viewAttendance } from '../api/attendanceService';

type AttendanceRow = {
  id: string;
  name: string;
  attendance?: {
    overall: number;
    present: number;
    absent: number;
    late: number;
  };
};

const TeacherAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        const [studentsResponse, attendanceResponse] = await Promise.all([
          getStudents(),
          viewAttendance(),
        ]);

        const studentList = Array.isArray(studentsResponse?.data)
          ? studentsResponse.data
          : Array.isArray(studentsResponse)
            ? studentsResponse
            : Array.isArray(studentsResponse?.data?.data)
              ? studentsResponse.data.data
              : [];

        const attendanceRecords = Array.isArray(attendanceResponse)
          ? attendanceResponse
          : Array.isArray(attendanceResponse?.records)
            ? attendanceResponse.records
            : [];

        const groupedAttendance = attendanceRecords.reduce((acc: Record<string, any[]>, record: any) => {
          const key = String(record.studentId ?? record.student_id ?? record.id ?? '');
          if (!key) return acc;
          acc[key] = acc[key] || [];
          acc[key].push(record);
          return acc;
        }, {});

        const attendanceRows = studentList.map((student: any) => {
          const studentKey = String(student.id);
          const records = groupedAttendance[studentKey] || [];
          const present = records.filter((record) => String(record.status).toLowerCase() === 'present').length;
          const absent = records.filter((record) => String(record.status).toLowerCase() === 'absent').length;
          const late = records.filter((record) => String(record.status).toLowerCase() === 'late').length;
          const overall = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

          return {
            id: studentKey,
            name: student.name ?? `Student ${student.id}`,
            attendance: {
              overall,
              present,
              absent,
              late,
            },
          };
        });

        setRows(attendanceRows);
      } catch (fetchError) {
        console.error('Failed to load attendance overview:', fetchError);
        setError('Failed to load attendance data from the API.');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const classData = useMemo(() => rows, [rows]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading attendance overview...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Class Attendance Overview</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Roll No</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Overall Attendance</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {classData.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{student.id}</td>
                <td className="p-4 font-semibold">{student.name}</td>
                <td className="p-4">{student.attendance?.overall}%</td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      navigate(`/teacher/attendance/${student.id}`);
                    }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    View Detailed Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherAttendancePage;