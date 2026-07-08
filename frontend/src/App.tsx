// import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
// import { useState } from "react";
// import { Menu } from "lucide-react";
// import AdminResultsDashboard from "./admin/pages/AdminResultsDashboard";
// import Dashboard from "./students/pages/Dashboard";
// import Attendance from "./students/pages/Attendance";
// import Profile from "./students/pages/Profile";
// import StudentSidebar from "./students/components/StudentSidebar";
// import ResultsPage from "./exams/ResultsPage"; 

// import ClassResultsPage from "./teachers/ClassResultsPage"; // ADDED IMPORT


// import { CreateAssignment, StudentDashboard, TeacherDashboard } from './assignments';
// import TeacherLayout from "./teachers/components/TeacherLayout";
// import Login from "./auth/Login";
// import ForgotPassword from "./auth/ForgotPassword";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import CommonNavbar from "./components/layout/CommonNavbar";
// import Footer from "./components/layout/Footer";
// import AdminDashboard from "./admin/pages/AdminDashboard";
// import AdminLayout from "./admin/components/AdminLayout";

// const StudentLayout: React.FC = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   return (
//     <div className="flex bg-[#F8FAFF] min-h-screen">
//       <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//       <button onClick={() => setSidebarOpen(true)} className="md:hidden fixed top-4 left-4 z-50 bg-[#2f3273] text-white p-2 rounded-lg shadow-lg">
//         <Menu size={22} />
//       </button>
//       <main className="flex-1 p-6 overflow-y-auto">
//         <CommonNavbar title="Student Dashboard" role="Student" />
//         <Outlet />
//         <Footer />
//       </main>
//     </div>
//   );
// };

// function App() {
//   return (
//     <BrowserRouter>
      
//       <Routes>

//         {/* Public Routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/" element={<Navigate to="/login" replace />} />

//         {/* Protected Student Routes */}
//         <Route element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>

//         <Route path="/" element={<Login />} />

//         <Route
//           path="/forgot-password"
//           element={<ForgotPassword />}
//         />

//         <Route
//           element={
//             <ProtectedRoute allowedRole="student">
//               <StudentLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/attendance" element={<Attendance />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/results" element={<ResultsPage />} />
//           <Route path="/assignments" element={<StudentDashboard />} />
//         </Route>

    
//         {/* Admin Routes */}
//         <Route element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
//           <Route path="/admin/dashboard" element={<AdminDashboard />} />
//           <Route path="/admin/results" element={<AdminResultsDashboard />} />

        
//       {/* Admin */}  
//         <Route
//           element={
//             <ProtectedRoute allowedRole="admin">
//               <AdminLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route
//             path="/admin/dashboard"
//             element={<AdminDashboard />}
//           />
//         </Route>

//         {/* Teacher Routes */}
//         <Route element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
//           <Route path="/teacher/assignments" element={<TeacherDashboard />} />
//           <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
//           <Route path="/teacher/results" element={<ClassResultsPage />} />
//         </Route>

//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import AdminResultsDashboard from "./admin/pages/AdminResultsDashboard";
import Dashboard from "./students/pages/Dashboard";
import Attendance from "./students/pages/Attendance";
import Profile from "./students/pages/Profile";
import StudentSidebar from "./students/components/StudentSidebar";
import ResultsPage from "./exams/ResultsPage"; 
import ClassResultsPage from "./teachers/ClassResultsPage"; 
import { CreateAssignment, StudentDashboard, TeacherDashboard } from './assignments';
import { NotificationsPage } from "./notifications/pages/Notifications";
import { AttendanceReports } from "./reports/pages/AttendanceReports";
import TeacherLayout from "./teachers/components/TeacherLayout";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import CommonNavbar from "./components/layout/CommonNavbar";
import Footer from "./components/layout/Footer";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLayout from "./admin/components/AdminLayout";
import TeacherAttendancePage from "./teachers/TeacherAttendancePage";
import StudentDetailAttendance from "./teachers/StudentDetailAttendance";
import AdminStudents from "./students/pages/Students";
import AdminTeachers from "./teachers/Teachers";
import AdminParents from "./parent/Parents";
import AdminAttendance from "./attendance/pages/AdminAttendance";
import Fees from "./fees/Fees";
import Timetable from "./timetable/Timetable";
import Library from "./Library/Library";
import Reports from "./reports/Reports";
import Settings from "./settings/Settings";

const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex bg-[#F8FAFF] min-h-screen">
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <button onClick={() => setSidebarOpen(true)} className="md:hidden fixed top-4 left-4 z-50 bg-[#2f3273] text-white p-2 rounded-lg shadow-lg">
        <Menu size={22} />
      </button>
      <main className="flex-1 p-6 overflow-y-auto">
        <CommonNavbar title="Student Dashboard" role="Student" />
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
        <Route
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/assignments" element={<StudentDashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/attendance-reports" element={<AttendanceReports />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/results" element={<AdminResultsDashboard />} />
        <Route
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/results" element={<AdminResultsDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/parents" element={<AdminParents />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/fees" element={<Fees />} />
          <Route path="/admin/timetable" element={<Timetable />} />
          <Route path="/admin/library" element={<Library />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
          <Route path="/teacher/assignments" element={<TeacherDashboard />} />
          <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
          <Route path="/teacher/results" element={<ClassResultsPage />} />
          <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
          <Route path="/teacher/attendance/:studentId" element={<StudentDetailAttendance />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
