import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  NotebookPen,
  ClipboardList,
  BookOpenCheck,
  FileClock,
  CalendarDays,
  Wallet,
  Bell,
  MessageSquareQuote,
  Settings,
  LogOut,
  Menu,
  X,
  School,
} from "lucide-react";

// Reuses the EXACT SAME stylesheet as the Admin Sidebar
import "../../components/Sidebar.css";
import { useParentPreview } from "../context/ParentPreviewContext.jsx";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/parent/dashboard", icon: LayoutDashboard },
  { label: "Attendance", path: "/parent/attendance", icon: CalendarCheck },
  { label: "Marks", path: "/parent/marks", icon: NotebookPen },
  { label: "Assignments", path: "/parent/assignments", icon: ClipboardList },
  { label: "Homework", path: "/parent/homework", icon: BookOpenCheck },
  { label: "Examinations", path: "/parent/examinations", icon: FileClock },
  { label: "Timetable", path: "/parent/timetable", icon: CalendarDays },
  { label: "Fees", path: "/parent/fees", icon: Wallet },
  { label: "Notifications", path: "/parent/notifications", icon: Bell },
  { label: "Teacher Remarks", path: "/parent/remarks", icon: MessageSquareQuote },
];

function ParentSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { parent } = useParentPreview();

  const closeMobileMenu = () => setIsMobileOpen(false);

  const initials = parent?.name
    ? parent.name.trim().charAt(0).toUpperCase()
    : "P";

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <span className="sidebar__brand-icon">
              <School size={20} />
            </span>

            <div className="sidebar__brand-text">
              <span className="sidebar__brand-name">Brightwood ERP</span>
              <span className="sidebar__brand-sub">Parent Portal</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          <span className="sidebar__nav-label">Menu</span>

          <ul className="sidebar__list">
            {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `sidebar__link ${
                      isActive ? "sidebar__link--active" : ""
                    }`
                  }
                >
                  <span className="sidebar__link-indicator" />
                  <Icon size={19} className="sidebar__link-icon" />
                  <span className="sidebar__link-text">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <span className="sidebar__nav-label">Account</span>

          <ul className="sidebar__list">
            <li>
              <NavLink
                to="/parent/settings"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `sidebar__link ${
                    isActive ? "sidebar__link--active" : ""
                  }`
                }
              >
                <span className="sidebar__link-indicator" />
                <Settings size={19} className="sidebar__link-icon" />
                <span className="sidebar__link-text">Settings</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className="sidebar__link"
              >
                <span className="sidebar__link-indicator" />
                <LogOut size={19} className="sidebar__link-icon" />
                <span className="sidebar__link-text">Logout</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span className="sidebar__user-avatar">
              {initials}
            </span>

            <div className="sidebar__user-info">
              <span className="sidebar__user-name">
                {parent?.name || "Parent"}
              </span>

              <span className="sidebar__user-role">
                {parent?.relationship || "Guardian"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default ParentSidebar;