import { Link } from "react-router-dom";
import "./pages.css";

function NotFound() {
  return (
    <div className="page" style={{ alignItems: "center", textAlign: "center", paddingTop: 60 }}>
      <h1 style={{ fontSize: 56, margin: 0, color: "#1a1f2b" }}>404</h1>
      <p style={{ color: "#7c8499", marginBottom: 20 }}>
        This page doesn't exist in Brightwood ERP.
      </p>
      <Link
        to="/admin"
        style={{
          color: "#5b6cff",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
