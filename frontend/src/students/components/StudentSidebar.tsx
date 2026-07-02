import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentSidebar = () => {
    const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };
  const navItems = [
    { label: "Dashboard", icon: "📊", active: true },
    { label: "Profile", icon: "👤", active: false },
    { label: "Attendance", icon: "📋", active: false },
    { label: "Results", icon: "📝" },
    { label: "Assignments", icon: "📝", active: false }
  ];

  return (
    <div className="hidden md:flex flex-col w-[260px] h-screen bg-[#2f3273] text-white sticky top-0 shadow-xl z-20">
      {/* Top Section */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl bg-white p-1 rounded text-[#2f3273]">🎓</span>
          <h1 className="text-xl font-bold tracking-wide leading-tight">School ERP</h1>
        </div>
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mt-1">Student Portal</p>
      </div>

      {/* Navigation */}

      <div className="flex-1 px-4 mt-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            // Change this line to handle "Dashboard" specially 
            // because your path for dashboard is "/" or "dashboard"
            to={item.label === "Dashboard" ? "/dashboard" : `/${item.label.toLowerCase()}`}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#4a4d94] text-white shadow-sm font-semibold'
                  : 'text-blue-200 hover:bg-[#3b3e85] hover:text-white font-medium'
              }`
            }
          >
            <span className="text-xl opacity-90">{item.icon}</span>
            <span>{item.label === "Results" ? "Examination & Results" : item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 bg-[#24265a] rounded-lg mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold border border-blue-400">
            IS
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">Ishaan</p>
            <p className="text-xs text-blue-200 mt-0.5">Class 10-A • Roll 21</p>
          </div>
        </div>
        
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-blue-200 hover:text-white transition-colors duration-200 rounded-lg hover:bg-[#3b3e85]"
          >
          <span className="text-lg opacity-80">🚪</span>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
