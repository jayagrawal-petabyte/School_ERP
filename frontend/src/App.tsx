import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import AdminResultsDashboard from "./admin/pages/AdminResultsDashboard";
import Dashboard from "./students/pages/Dashboard";
import Attendance from "./students/pages/Attendance";
import Profile from "./students/pages/Profile";
import StudentSidebar from "./students/components/StudentSidebar";
import ResultsPage from "./exams/ResultsPage"; 

import ClassResultsPage from "./teachers/ClassResultsPage"; // ADDED IMPORT


import { CreateAssignment, StudentDashboard, TeacherDashboard } from './assignments';
import TeacherLayout from "./teachers/components/TeacherLayout";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import CommonNavbar from "./components/layout/CommonNavbar";
import Footer from "./components/layout/Footer";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLayout from "./admin/components/AdminLayout";

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

        <Route path="/" element={<Login />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

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
        </Route>

    
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/results" element={<AdminResultsDashboard />} />

        
      {/* Admin */}  
        <Route
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
          <Route path="/teacher/assignments" element={<TeacherDashboard />} />
          <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
          <Route path="/teacher/results" element={<ClassResultsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;