import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import CommonNavbar from "../../components/layout/CommonNavbar";
import Footer from "../../components/layout/Footer";
const TeacherLayout: React.FC = () => {
  return (
    <div className="flex bg-[#F8FAFF] min-h-screen">
      <TeacherSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <CommonNavbar
            title="Teacher Dashboard"
            role="Teacher"
        />

        <Outlet />
        <Footer />
        </main>
    </div>
  );
};

export default TeacherLayout;