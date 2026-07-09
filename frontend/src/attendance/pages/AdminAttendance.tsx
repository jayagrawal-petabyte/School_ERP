
// const AdminAttendance = () => {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Admin Attendance (Placeholder)</h1>
//       <p>This component is under construction.</p>
//     </div>
//   );
// };

// export default AdminAttendance;

// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";

// // --- MOCK DATA ---
// const studentData = [
//   { id: 1, name: "Aarav Kumar", idCode: "STU015", grade: "10", section: "A", attendancePercentage: 92 },
//   { id: 2, name: "Diya Sharma", idCode: "STU022", grade: "10", section: "A", attendancePercentage: 85 },
//   { id: 3, name: "Vihaan Singh", idCode: "STU034", grade: "10", section: "B", attendancePercentage: 78 },
//   { id: 4, name: "Ananya Krishnan", idCode: "STU041", grade: "10", section: "A", attendancePercentage: 96 },
//   { id: 5, name: "Rohan Das", idCode: "STU055", grade: "10", section: "C", attendancePercentage: 88 },
//   { id: 6, name: "Ishita Verma", idCode: "STU062", grade: "9", section: "A", attendancePercentage: 91 },
//   { id: 7, name: "Karan Patel", idCode: "STU077", grade: "9", section: "B", attendancePercentage: 73 },
// ];

// const teacherData = [
//   { id: 1, name: "Mr. Rajesh Verma", idCode: "TCH001", status: "Present" },
//   { id: 2, name: "Ms. Sunita Rao", idCode: "TCH002", status: "Late" },
//   { id: 3, name: "Mr. Amit Singh", idCode: "TCH003", status: "Present" },
//   { id: 4, name: "Mrs. Kavita Iyer", idCode: "TCH004", status: "Absent" },
//   { id: 5, name: "Mr. Vikram Malhotra", idCode: "TCH005", status: "Present" },
//   { id: 6, name: "Ms. Priya Desai", idCode: "TCH006", status: "Present" },
//   { id: 7, name: "Mr. Sanjay Gupta", idCode: "TCH007", status: "Late" },
//   { id: 8, name: "Mrs. Meena Kumari", idCode: "TCH008", status: "Present" },
//   { id: 9, name: "Mr. Anil Kapoor", idCode: "TCH009", status: "Present" },
//   { id: 10, name: "Ms. Neha Sharma", idCode: "TCH010", status: "Absent" },
//   { id: 11, name: "Mr. Rahul Dravid", idCode: "TCH011", status: "Present" },
//   { id: 12, name: "Mrs. Anjali Tendulkar", idCode: "TCH012", status: "Present" },
//   { id: 13, name: "Mr. MS Dhoni", idCode: "TCH013", status: "Late" },
//   { id: 14, name: "Ms. Smriti Mandhana", idCode: "TCH014", status: "Present" },
//   { id: 15, name: "Mr. Virat Kohli", idCode: "TCH015", status: "Present" },
//   { id: 16, name: "Mrs. PV Sindhu", idCode: "TCH016", status: "Absent" },
//   { id: 17, name: "Mr. Neeraj Chopra", idCode: "TCH017", status: "Present" },
//   { id: 18, name: "Ms. Mary Kom", idCode: "TCH018", status: "Present" },
//   { id: 19, name: "Mr. Sunil Chhetri", idCode: "TCH019", status: "Present" },
//   { id: 20, name: "Mrs. Saina Nehwal", idCode: "TCH020", status: "Late" },
//   { id: 21, name: "Mr. Abhinav Bindra", idCode: "TCH021", status: "Present" },
//   { id: 22, name: "Ms. Hima Das", idCode: "TCH022", status: "Present" },
//   { id: 23, name: "Mr. Bajrang Punia", idCode: "TCH023", status: "Absent" },
//   { id: 24, name: "Mrs. Vinesh Phogat", idCode: "TCH024", status: "Present" },
//   { id: 25, name: "Mr. Ravi Dahiya", idCode: "TCH025", status: "Present" },
//   { id: 26, name: "Ms. Lovlina Borgohain", idCode: "TCH026", status: "Present" },
//   { id: 27, name: "Mr. PR Sreejesh", idCode: "TCH027", status: "Late" },
//   { id: 28, name: "Mrs. Mirabai Chanu", idCode: "TCH028", status: "Present" },
//   { id: 29, name: "Mr. Lakshya Sen", idCode: "TCH029", status: "Present" },
//   { id: 30, name: "Ms. Nikhat Zareen", idCode: "TCH030", status: "Present" },
// ];

// const staffData = [
//   { id: 1, name: "Amit Kumar (Admin)", idCode: "STF001", status: "Present" },
//   { id: 2, name: "Suresh Pillai (Security)", idCode: "STF002", status: "Present" },
//   { id: 3, name: "Kamala Devi (Janitorial)", idCode: "STF003", status: "Absent" },
//   { id: 4, name: "Ramesh Babu (Driver)", idCode: "STF004", status: "Late" },
//   { id: 5, name: "Geeta Menon (Librarian)", idCode: "STF005", status: "Present" },
//   { id: 6, name: "Abdul Khan (IT Support)", idCode: "STF006", status: "Present" },
//   { id: 7, name: "Sunita Williams (Nurse)", idCode: "STF007", status: "Present" },
//   { id: 8, name: "Manoj Tiwari (Maintenance)", idCode: "STF008", status: "Absent" },
//   { id: 9, name: "Pooja Hegde (Receptionist)", idCode: "STF009", status: "Present" },
//   { id: 10, name: "Karthik Raj (Accounts)", idCode: "STF010", status: "Late" },
// ];

// export default function AdminAttendance() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("students");
  
//   // State for Teachers/Staff marking
//   const [staffRecords, setStaffRecords] = useState(teacherData);
  
//   // State for Student Filtering
//   const [grade, setGrade] = useState("10");
//   const [section, setSection] = useState("A");
//   const [toast, setToast] = useState(null);

//   // Filter students dynamically based on dropdowns
//   const filteredStudents = useMemo(() => {
//     return studentData.filter(s => s.grade === grade && s.section === section);
//   }, [grade, section]);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     if (tab === "teachers") setStaffRecords(teacherData);
//     else if (tab === "staff") setStaffRecords(staffData);
//   };

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(null), 3000);
//   };

//   const handleStaffStatusChange = (id, newStatus) => {
//     setStaffRecords(staffRecords.map(r => r.id === id ? { ...r, status: newStatus } : r));
//   };

//   return (
//     <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
//       {toast && (
//         <div className="fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white bg-green-500">
//           {toast}
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-[#1a1f36]">Attendance Management</h1>
//           <p className="text-gray-500 text-sm">Manage attendance for Students, Teachers, and Staff</p>
//         </div>
//         {activeTab !== "students" && (
//           <button onClick={() => showToast("Attendance Saved")} className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">
//             Save Changes
//           </button>
//         )}
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-6">
//         {['students', 'teachers', 'staff'].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => handleTabChange(tab)}
//             className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${
//               activeTab === tab ? "bg-[#3949ab] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Conditional Rendering: Student Dashboard vs Staff Roll Call */}
//       {activeTab === "students" ? (
//         <>
//           {/* Student Filters */}
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
//               <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
//                 {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1)}>Class {i+1}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
//               <select value={section} onChange={(e) => setSection(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
//                 {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
//               </select>
//             </div>
//           </div>

//           {/* Student Table */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
//                   <th className="p-4 font-bold">ID / Code</th>
//                   <th className="p-4 font-bold">Name</th>
//                   <th className="p-4 font-bold">Overall Attendance</th>
//                   <th className="p-4 font-bold">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="text-sm">
//                 {filteredStudents.length > 0 ? filteredStudents.map((r) => (
//                   <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
//                     <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
//                     <td 
//                       className="p-4 font-semibold text-indigo-600 cursor-pointer hover:underline"
//                       onClick={() => navigate(`/admin/attendance/student/${r.id}`)}
//                     >
//                       {r.name}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-2">
//                         <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
//                           <div className={`h-2.5 rounded-full ${r.attendancePercentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${r.attendancePercentage}%` }}></div>
//                         </div>
//                         <span className="font-semibold text-gray-700">{r.attendancePercentage}%</span>
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <button 
//                         onClick={() => navigate(`/admin/attendance/student/${r.id}`)}
//                         className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-xs transition"
//                       >
//                         View Report
//                       </button>
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr>
//                     <td colSpan="4" className="p-6 text-center text-gray-500">No students found for this class and section.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       ) : (
//         /* Staff & Teachers Table */
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
//                 <th className="p-4 font-bold">ID / Code</th>
//                 <th className="p-4 font-bold">Name</th>
//                 <th className="p-4 font-bold">Status</th>
//                 <th className="p-4 font-bold">Action</th>
//               </tr>
//             </thead>
//             <tbody className="text-sm">
//               {staffRecords.map((r) => (
//                 <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
//                   <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
//                   <td className="p-4 font-semibold text-gray-800">{r.name}</td>
//                   <td className="p-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                       r.status === 'Present' ? 'bg-green-100 text-green-700' :
//                       r.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
//                     }`}>
//                       {r.status}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex gap-2">
//                       <button onClick={() => handleStaffStatusChange(r.id, 'Present')} className="px-2 py-1 bg-green-500 hover:bg-green-600 transition text-white rounded text-xs">P</button>
//                       <button onClick={() => handleStaffStatusChange(r.id, 'Absent')} className="px-2 py-1 bg-red-500 hover:bg-red-600 transition text-white rounded text-xs">A</button>
//                       <button onClick={() => handleStaffStatusChange(r.id, 'Late')} className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 transition text-white rounded text-xs">L</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";

// // --- MOCK DATA ---
// const studentData = [
//   { id: 1, name: "Aarav Kumar", idCode: "STU015", grade: "10", section: "A", attendancePercentage: 92 },
//   { id: 2, name: "Diya Sharma", idCode: "STU022", grade: "10", section: "A", attendancePercentage: 85 },
//   { id: 3, name: "Vihaan Singh", idCode: "STU034", grade: "10", section: "B", attendancePercentage: 78 },
//   { id: 4, name: "Ananya Krishnan", idCode: "STU041", grade: "10", section: "A", attendancePercentage: 96 },
//   { id: 5, name: "Rohan Das", idCode: "STU055", grade: "10", section: "C", attendancePercentage: 62 },
//   { id: 6, name: "Ishita Verma", idCode: "STU062", grade: "9", section: "A", attendancePercentage: 91 },
//   { id: 7, name: "Karan Patel", idCode: "STU077", grade: "9", section: "B", attendancePercentage: 73 },
// ];

// const teacherData = [
//   { id: 1, name: "Mr. Rajesh Verma", idCode: "TCH001", status: "Present", attendancePercentage: 98 },
//   { id: 2, name: "Ms. Sunita Rao", idCode: "TCH002", status: "Late", attendancePercentage: 75 },
//   { id: 3, name: "Mr. Amit Singh", idCode: "TCH003", status: "Present", attendancePercentage: 88 },
//   { id: 4, name: "Mrs. Kavita Iyer", idCode: "TCH004", status: "Absent", attendancePercentage: 64 },
//   { id: 5, name: "Mr. Vikram Malhotra", idCode: "TCH005", status: "Present", attendancePercentage: 92 },
//   { id: 6, name: "Ms. Priya Desai", idCode: "TCH006", status: "Present", attendancePercentage: 81 },
//   { id: 7, name: "Mr. Sanjay Gupta", idCode: "TCH007", status: "Late", attendancePercentage: 68 },
//   { id: 8, name: "Mrs. Meena Kumari", idCode: "TCH008", status: "Present", attendancePercentage: 95 },
//   { id: 9, name: "Mr. Anil Kapoor", idCode: "TCH009", status: "Present", attendancePercentage: 89 },
//   { id: 10, name: "Ms. Neha Sharma", idCode: "TCH010", status: "Absent", attendancePercentage: 55 },
//   { id: 11, name: "Mr. Rahul Dravid", idCode: "TCH011", status: "Present", attendancePercentage: 100 },
//   { id: 12, name: "Mrs. Anjali Tendulkar", idCode: "TCH012", status: "Present", attendancePercentage: 94 },
//   { id: 13, name: "Mr. MS Dhoni", idCode: "TCH013", status: "Late", attendancePercentage: 79 },
//   { id: 14, name: "Ms. Smriti Mandhana", idCode: "TCH014", status: "Present", attendancePercentage: 85 },
//   { id: 15, name: "Mr. Virat Kohli", idCode: "TCH015", status: "Present", attendancePercentage: 82 },
//   { id: 16, name: "Mrs. PV Sindhu", idCode: "TCH016", status: "Absent", attendancePercentage: 71 },
//   { id: 17, name: "Mr. Neeraj Chopra", idCode: "TCH017", status: "Present", attendancePercentage: 90 },
//   { id: 18, name: "Ms. Mary Kom", idCode: "TCH018", status: "Present", attendancePercentage: 96 },
//   { id: 19, name: "Mr. Sunil Chhetri", idCode: "TCH019", status: "Present", attendancePercentage: 99 },
//   { id: 20, name: "Mrs. Saina Nehwal", idCode: "TCH020", status: "Late", attendancePercentage: 67 },
//   { id: 21, name: "Mr. Abhinav Bindra", idCode: "TCH021", status: "Present", attendancePercentage: 97 },
//   { id: 22, name: "Ms. Hima Das", idCode: "TCH022", status: "Present", attendancePercentage: 84 },
//   { id: 23, name: "Mr. Bajrang Punia", idCode: "TCH023", status: "Absent", attendancePercentage: 60 },
//   { id: 24, name: "Mrs. Vinesh Phogat", idCode: "TCH024", status: "Present", attendancePercentage: 86 },
//   { id: 25, name: "Mr. Ravi Dahiya", idCode: "TCH025", status: "Present", attendancePercentage: 91 },
//   { id: 26, name: "Ms. Lovlina Borgohain", idCode: "TCH026", status: "Present", attendancePercentage: 88 },
//   { id: 27, name: "Mr. PR Sreejesh", idCode: "TCH027", status: "Late", attendancePercentage: 77 },
//   { id: 28, name: "Mrs. Mirabai Chanu", idCode: "TCH028", status: "Present", attendancePercentage: 93 },
//   { id: 29, name: "Mr. Lakshya Sen", idCode: "TCH029", status: "Present", attendancePercentage: 80 },
//   { id: 30, name: "Ms. Nikhat Zareen", idCode: "TCH030", status: "Present", attendancePercentage: 85 },
// ];

// const staffData = [
//   { id: 1, name: "Amit Kumar (Admin)", idCode: "STF001", status: "Present", attendancePercentage: 98 },
//   { id: 2, name: "Suresh Pillai (Security)", idCode: "STF002", status: "Present", attendancePercentage: 100 },
//   { id: 3, name: "Kamala Devi (Janitorial)", idCode: "STF003", status: "Absent", attendancePercentage: 62 },
//   { id: 4, name: "Ramesh Babu (Driver)", idCode: "STF004", status: "Late", attendancePercentage: 74 },
//   { id: 5, name: "Geeta Menon (Librarian)", idCode: "STF005", status: "Present", attendancePercentage: 95 },
//   { id: 6, name: "Abdul Khan (IT Support)", idCode: "STF006", status: "Present", attendancePercentage: 89 },
//   { id: 7, name: "Sunita Williams (Nurse)", idCode: "STF007", status: "Present", attendancePercentage: 92 },
//   { id: 8, name: "Manoj Tiwari (Maintenance)", idCode: "STF008", status: "Absent", attendancePercentage: 58 },
//   { id: 9, name: "Pooja Hegde (Receptionist)", idCode: "STF009", status: "Present", attendancePercentage: 81 },
//   { id: 10, name: "Karthik Raj (Accounts)", idCode: "STF010", status: "Late", attendancePercentage: 78 },
// ];

// export default function AdminAttendance() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("students");
  
//   const [staffRecords, setStaffRecords] = useState(teacherData);
  
//   const [grade, setGrade] = useState("10");
//   const [section, setSection] = useState("A");
//   const [toast, setToast] = useState(null);

//   const filteredStudents = useMemo(() => {
//     return studentData.filter(s => s.grade === grade && s.section === section);
//   }, [grade, section]);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     if (tab === "teachers") setStaffRecords(teacherData);
//     else if (tab === "staff") setStaffRecords(staffData);
//   };

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(null), 3000);
//   };

//   const handleStaffStatusChange = (id, newStatus) => {
//     setStaffRecords(staffRecords.map(r => r.id === id ? { ...r, status: newStatus } : r));
//   };

//   // Helper function to determine progress bar color
//   const getProgressBarColor = (percentage) => {
//     if (percentage >= 80) return 'bg-green-500';
//     if (percentage >= 65) return 'bg-yellow-500';
//     return 'bg-red-500';
//   };

//   return (
//     <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
//       {toast && (
//         <div className="fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white bg-green-500">
//           {toast}
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-[#1a1f36]">Attendance Management</h1>
//           <p className="text-gray-500 text-sm">Manage attendance for Students, Teachers, and Staff</p>
//         </div>
//         {activeTab !== "students" && (
//           <button onClick={() => showToast("Attendance Saved")} className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">
//             Save Changes
//           </button>
//         )}
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-6">
//         {['students', 'teachers', 'staff'].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => handleTabChange(tab)}
//             className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${
//               activeTab === tab ? "bg-[#3949ab] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Conditional Rendering: Student Dashboard vs Staff Roll Call */}
//       {activeTab === "students" ? (
//         <>
//           {/* Student Filters */}
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
//               <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
//                 {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1)}>Class {i+1}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
//               <select value={section} onChange={(e) => setSection(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
//                 {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
//               </select>
//             </div>
//           </div>

//           {/* Student Table */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
//                   <th className="p-4 font-bold">ID / Code</th>
//                   <th className="p-4 font-bold">Name</th>
//                   <th className="p-4 font-bold">Overall Attendance</th>
//                   <th className="p-4 font-bold">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="text-sm">
//                 {filteredStudents.length > 0 ? filteredStudents.map((r) => (
//                   <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
//                     <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
//                     <td 
//                       className="p-4 font-semibold text-indigo-600 cursor-pointer hover:underline"
//                       onClick={() => navigate(`/admin/attendance/student/${r.id}`)}
//                     >
//                       {r.name}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-2">
//                         <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
//                           <div className={`h-2.5 rounded-full ${getProgressBarColor(r.attendancePercentage)}`} style={{ width: `${r.attendancePercentage}%` }}></div>
//                         </div>
//                         <span className="font-semibold text-gray-700">{r.attendancePercentage}%</span>
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <button 
//                         onClick={() => navigate(`/admin/attendance/student/${r.id}`)}
//                         className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-xs transition"
//                       >
//                         View Report
//                       </button>
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr>
//                     <td colSpan="4" className="p-6 text-center text-gray-500">No students found for this class and section.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       ) : (
//         /* Staff & Teachers Table */
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
//                 <th className="p-4 font-bold">ID / Code</th>
//                 <th className="p-4 font-bold">Name</th>
//                 <th className="p-4 font-bold">Overall Attendance</th>
//                 <th className="p-4 font-bold">Status</th>
//                 <th className="p-4 font-bold">Action</th>
//               </tr>
//             </thead>
//             <tbody className="text-sm">
//               {staffRecords.map((r) => (
//                 <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
//                   <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
//                   <td className="p-4 font-semibold text-gray-800">{r.name}</td>
//                   <td className="p-4">
//                     <div className="flex items-center gap-2">
//                       <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
//                         <div className={`h-2.5 rounded-full ${getProgressBarColor(r.attendancePercentage)}`} style={{ width: `${r.attendancePercentage}%` }}></div>
//                       </div>
//                       <span className="font-semibold text-gray-700">{r.attendancePercentage}%</span>
//                     </div>
//                   </td>
//                   <td className="p-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                       r.status === 'Present' ? 'bg-green-100 text-green-700' :
//                       r.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
//                     }`}>
//                       {r.status}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex gap-2">
//                       <button onClick={() => handleStaffStatusChange(r.id, 'Present')} className="px-2 py-1 bg-green-500 hover:bg-green-600 transition text-white rounded text-xs">P</button>
//                       <button onClick={() => handleStaffStatusChange(r.id, 'Absent')} className="px-2 py-1 bg-red-500 hover:bg-red-600 transition text-white rounded text-xs">A</button>
//                       <button onClick={() => handleStaffStatusChange(r.id, 'Late')} className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 transition text-white rounded text-xs">L</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// --- DYNAMIC DATA GENERATOR ---
const grades = ["LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
const sections = ["A", "B", "C", "D", "E"];

const getRandomName = () => {
  const firstNames = ["Aarav", "Ishaan", "Priya", "Ananya", "Rohan", "Sneha", "Vikram", "Meera", "Karan", "Diya", "Aditi", "Rahul", "Neha", "Kabir", "Zara"];
  const lastNames = ["Kumar", "Sharma", "Singh", "Krishnan", "Das", "Verma", "Patel", "Reddy", "Gupta", "Rao"];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

interface Student {
  id: number;
  name: string;
  idCode: string;
  grade: string;
  section: string;
  attendancePercentage: number;
}

const generateStudentData = () => {
  let globalId = 1;
  const allStudents: Student[] = [];

  grades.forEach((grade) => {
    sections.forEach((section) => {
      // Generate between 20 and 30 students per section
      const studentCount = 20 + Math.floor(Math.random() * 11); 
      for (let i = 0; i < studentCount; i++) {
        allStudents.push({
          id: globalId,
          name: getRandomName(),
          idCode: `STU${String(globalId).padStart(4, '0')}`, // Creates format like STU0001, STU0015
          grade: grade,
          section: section,
          // Generate a random attendance percentage between 40% and 100%
          attendancePercentage: Math.floor(40 + Math.random() * 61) 
        });
        globalId++;
      }
    });
  });
  return allStudents;
};

// Generate the massive student list once
const studentData = generateStudentData();

// --- STATIC STAFF DATA ---
const teacherData = [
  { id: 1, name: "Mr. Rajesh Verma", idCode: "TCH001", status: "Present", attendancePercentage: 98 },
  { id: 2, name: "Ms. Sunita Rao", idCode: "TCH002", status: "Late", attendancePercentage: 75 },
  { id: 3, name: "Mr. Amit Singh", idCode: "TCH003", status: "Present", attendancePercentage: 88 },
  { id: 4, name: "Mrs. Kavita Iyer", idCode: "TCH004", status: "Absent", attendancePercentage: 64 },
  { id: 5, name: "Mr. Vikram Malhotra", idCode: "TCH005", status: "Present", attendancePercentage: 92 },
  { id: 6, name: "Ms. Priya Desai", idCode: "TCH006", status: "Present", attendancePercentage: 81 },
  { id: 7, name: "Mr. Sanjay Gupta", idCode: "TCH007", status: "Late", attendancePercentage: 68 },
  { id: 8, name: "Mrs. Meena Kumari", idCode: "TCH008", status: "Present", attendancePercentage: 95 },
  { id: 9, name: "Mr. Anil Kapoor", idCode: "TCH009", status: "Present", attendancePercentage: 89 },
  { id: 10, name: "Ms. Neha Sharma", idCode: "TCH010", status: "Absent", attendancePercentage: 55 },
  { id: 11, name: "Mr. Rahul Dravid", idCode: "TCH011", status: "Present", attendancePercentage: 100 },
  { id: 12, name: "Mrs. Anjali Tendulkar", idCode: "TCH012", status: "Present", attendancePercentage: 94 },
  { id: 13, name: "Mr. MS Dhoni", idCode: "TCH013", status: "Late", attendancePercentage: 79 },
  { id: 14, name: "Ms. Smriti Mandhana", idCode: "TCH014", status: "Present", attendancePercentage: 85 },
  { id: 15, name: "Mr. Virat Kohli", idCode: "TCH015", status: "Present", attendancePercentage: 82 },
  { id: 16, name: "Mrs. PV Sindhu", idCode: "TCH016", status: "Absent", attendancePercentage: 71 },
  { id: 17, name: "Mr. Neeraj Chopra", idCode: "TCH017", status: "Present", attendancePercentage: 90 },
  { id: 18, name: "Ms. Mary Kom", idCode: "TCH018", status: "Present", attendancePercentage: 96 },
  { id: 19, name: "Mr. Sunil Chhetri", idCode: "TCH019", status: "Present", attendancePercentage: 99 },
  { id: 20, name: "Mrs. Saina Nehwal", idCode: "TCH020", status: "Late", attendancePercentage: 67 },
  { id: 21, name: "Mr. Abhinav Bindra", idCode: "TCH021", status: "Present", attendancePercentage: 97 },
  { id: 22, name: "Ms. Hima Das", idCode: "TCH022", status: "Present", attendancePercentage: 84 },
  { id: 23, name: "Mr. Bajrang Punia", idCode: "TCH023", status: "Absent", attendancePercentage: 60 },
  { id: 24, name: "Mrs. Vinesh Phogat", idCode: "TCH024", status: "Present", attendancePercentage: 86 },
  { id: 25, name: "Mr. Ravi Dahiya", idCode: "TCH025", status: "Present", attendancePercentage: 91 },
  { id: 26, name: "Ms. Lovlina Borgohain", idCode: "TCH026", status: "Present", attendancePercentage: 88 },
  { id: 27, name: "Mr. PR Sreejesh", idCode: "TCH027", status: "Late", attendancePercentage: 77 },
  { id: 28, name: "Mrs. Mirabai Chanu", idCode: "TCH028", status: "Present", attendancePercentage: 93 },
  { id: 29, name: "Mr. Lakshya Sen", idCode: "TCH029", status: "Present", attendancePercentage: 80 },
  { id: 30, name: "Ms. Nikhat Zareen", idCode: "TCH030", status: "Present", attendancePercentage: 85 },
];

const staffData = [
  { id: 1, name: "Amit Kumar (Admin)", idCode: "STF001", status: "Present", attendancePercentage: 98 },
  { id: 2, name: "Suresh Pillai (Security)", idCode: "STF002", status: "Present", attendancePercentage: 100 },
  { id: 3, name: "Kamala Devi (Janitorial)", idCode: "STF003", status: "Absent", attendancePercentage: 62 },
  { id: 4, name: "Ramesh Babu (Driver)", idCode: "STF004", status: "Late", attendancePercentage: 74 },
  { id: 5, name: "Geeta Menon (Librarian)", idCode: "STF005", status: "Present", attendancePercentage: 95 },
  { id: 6, name: "Abdul Khan (IT Support)", idCode: "STF006", status: "Present", attendancePercentage: 89 },
  { id: 7, name: "Sunita Williams (Nurse)", idCode: "STF007", status: "Present", attendancePercentage: 92 },
  { id: 8, name: "Manoj Tiwari (Maintenance)", idCode: "STF008", status: "Absent", attendancePercentage: 58 },
  { id: 9, name: "Pooja Hegde (Receptionist)", idCode: "STF009", status: "Present", attendancePercentage: 81 },
  { id: 10, name: "Karthik Raj (Accounts)", idCode: "STF010", status: "Late", attendancePercentage: 78 },
];

export default function AdminAttendance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  
  const [staffRecords, setStaffRecords] = useState(teacherData);
  
  // Set defaults to match the generator arrays
  const [grade, setGrade] = useState(grades[0]); 
  const [section, setSection] = useState(sections[0]);
  const [toast, setToast] = useState<string | null>(null);

  // Filter students based on dropdowns
  const filteredStudents = useMemo(() => {
    return studentData.filter(s => s.grade === grade && s.section === section);
  }, [grade, section]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "teachers") setStaffRecords(teacherData);
    else if (tab === "staff") setStaffRecords(staffData);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStaffStatusChange = (id: number, newStatus: string) => {
    setStaffRecords(staffRecords.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 65) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white bg-green-500">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Attendance Management</h1>
          <p className="text-gray-500 text-sm">Manage attendance for Students, Teachers, and Staff</p>
        </div>
        {activeTab !== "students" && (
          <button onClick={() => showToast("Attendance Saved")} className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">
            Save Changes
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {['students', 'teachers', 'staff'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${
              activeTab === tab ? "bg-[#3949ab] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "students" ? (
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
              {/* Dynamically map over the grades array so the dropdown perfectly matches the data */}
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
              {/* Dynamically map over the sections array */}
              <select value={section} onChange={(e) => setSection(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">ID / Code</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Overall Attendance</th>
                  <th className="p-4 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredStudents.length > 0 ? filteredStudents.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
                    <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
                    <td 
                      className="p-4 font-semibold text-indigo-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/attendance/student/${r.id}`)}
                    >
                      {r.name}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                          <div className={`h-2.5 rounded-full ${getProgressBarColor(r.attendancePercentage)}`} style={{ width: `${r.attendancePercentage}%` }}></div>
                        </div>
                        <span className="font-semibold text-gray-700">{r.attendancePercentage}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => navigate(`/admin/attendance/student/${r.id}`)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-xs transition"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">No students found for this class and section.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">ID / Code</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Overall Attendance</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {staffRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
                  <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
                  <td className="p-4 font-semibold text-gray-800">{r.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                        <div className={`h-2.5 rounded-full ${getProgressBarColor(r.attendancePercentage)}`} style={{ width: `${r.attendancePercentage}%` }}></div>
                      </div>
                      <span className="font-semibold text-gray-700">{r.attendancePercentage}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === 'Present' ? 'bg-green-100 text-green-700' :
                      r.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleStaffStatusChange(r.id, 'Present')} className="px-2 py-1 bg-green-500 hover:bg-green-600 transition text-white rounded text-xs">P</button>
                      <button onClick={() => handleStaffStatusChange(r.id, 'Absent')} className="px-2 py-1 bg-red-500 hover:bg-red-600 transition text-white rounded text-xs">A</button>
                      <button onClick={() => handleStaffStatusChange(r.id, 'Late')} className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 transition text-white rounded text-xs">L</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
