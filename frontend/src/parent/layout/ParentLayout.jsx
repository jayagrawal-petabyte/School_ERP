import { Outlet } from "react-router-dom";
import ParentSidebar from "../components/ParentSidebar.jsx";
import ParentNavbar from "../components/ParentNavbar.jsx";

// Reuses the EXACT SAME layout stylesheet as the Admin shell.
import "../../components/AppLayout.css";

import { ParentPreviewProvider } from "../context/ParentPreviewContext.jsx";

// Mirrors AppLayout.jsx's structure exactly, but swaps in the Parent-facing
// sidebar/navbar and scopes the temporary preview context to this subtree only.
function ParentLayout() {
  return (
    <ParentPreviewProvider>
      <div className="app-layout">
        <ParentSidebar />

        <div className="app-layout__main">
          <ParentNavbar />

          <main className="app-layout__content">
            <Outlet />
          </main>
        </div>
      </div>
    </ParentPreviewProvider>
  );
}

export default ParentLayout;