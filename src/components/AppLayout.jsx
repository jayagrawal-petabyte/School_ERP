import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./AppLayout.css";

// Persistent shell: Sidebar + Navbar render once and stay mounted.
// <Outlet /> swaps in the matched page below them on every navigation,
// so switching routes never re-renders the nav chrome.
function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout__main">
        <Navbar />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
