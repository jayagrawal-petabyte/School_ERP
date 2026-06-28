import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
// import StudentLayout from "./students/components/StudentLayout"; // removed, using inline layout
import Dashboard from "./students/pages/Dashboard";
import Attendance from "./students/pages/Attendance";
import Profile from "./students/pages/Profile";
import StudentSidebar from "./students/components/StudentSidebar";


const StudentLayout: React.FC = () => (
  <div className="flex bg-[#F8FAFF] min-h-screen">
    <StudentSidebar />
    <main className="flex-1 p-6 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;