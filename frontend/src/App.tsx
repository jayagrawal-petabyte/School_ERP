import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
// import StudentLayout from "./students/components/StudentLayout"; // removed, using inline layout
import Dashboard from "./students/pages/Dashboard";
import Attendance from "./students/pages/Attendance";
import Profile from "./students/pages/Profile";
import StudentSidebar from "./students/components/StudentSidebar";

import ResultsPage from "./exams/ResultsPage"; 

import ClassResultsPage from "./teachers/ClassResultsPage"; // Add this line
import { CreateAssignment, StudentDashboard, TeacherDashboard } from './assignments';
import TeacherLayout from "./teachers/components/TeacherLayout";
import Login from "./auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import CommonNavbar from "./components/layout/CommonNavbar";
import Footer from "./components/layout/Footer";


const StudentLayout: React.FC = () => (
  <div className="flex bg-[#F8FAFF] min-h-screen">
    <StudentSidebar />

    <main className="flex-1 p-6 overflow-y-auto">
      <CommonNavbar
        title="Student Dashboard"
        role="Student"
      />

      <Outlet />
      <Footer />
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<StudentLayout />}> */}
          {/* <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<Profile />} />
          <Route path="results" element={<ResultsPage />} /> Add this line */}

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Protected Student Routes */}
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
          <Route path="/assignments" element={<StudentDashboard />} />
          <Route path="/results" element={<ResultsPage />} />
        </Route>

        {/* Teacher */}
        {/* Protected Teacher Routes */}
        <Route
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/teacher/assignments"
            element={<TeacherDashboard />}
          />

          <Route
            path="/teacher/assignments/create"
            element={<CreateAssignment />}
          />

          {/* <Route path="/teacher/results" element={<ResultsPage />} /> */}
          <Route path="/teacher/results" element={<ClassResultsPage />} />
        </Route>
        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}


export default App;