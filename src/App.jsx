import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Parents from "./pages/Parents";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing route "/" redirects straight to the admin dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* AppLayout renders Sidebar + Navbar once, and an <Outlet />
            swaps in whichever child route below matches the URL. */}
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/parents" element={<Parents />} />
        </Route>

        {/* Catch-all for any unmatched path */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;