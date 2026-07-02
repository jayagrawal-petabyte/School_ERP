import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authenticate } from "../services/authServices";

import {
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUsers,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import "../styles/Login.css";

type Errors = {
  email?: string;
  password?: string;
  login?: string;
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("admin");
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockTime, setLockTime] = useState(0);
  
    useEffect(() => {
    if (lockTime <= 0) {
        setErrors((prev) => ({
        ...prev,
        login: "",
        }));
        return;
    }

    const timer = setInterval(() => {
        setLockTime((prev) => prev - 1);
    }, 1000);

  return () => clearInterval(timer);
}, [lockTime]);

  const handleLogin = () => {
     if (lockTime > 0) {
        return;
    }
    const newErrors: Errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      const user = authenticate(email, password, role);

      if (!user) {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);

        if (attempts >= 3) {
            setLockTime(30);
            setFailedAttempts(0);

            setErrors({
            login: "Too many failed attempts. Try again in 30 seconds.",
            });
        } else {
            setErrors({
            login: "Invalid Credentials",
            });
        }

        setLoading(false);
        return;
    }

      login(role, rememberMe);
        setFailedAttempts(0);
      switch (role) {
        case "student":
            navigate("/dashboard");
            break;

        case "teacher":
            navigate("/teacher/assignments");
            break;

        case "admin":
            navigate("/dashboard");
            break;

        case "parent":
            navigate("/dashboard");
            break;

        default:
            navigate("/");
        }

      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="title">School ERP</h1>
        <p className="subtitle">Welcome Back</p>

        <div className="role-container">
          <button
            className={role === "admin" ? "role active" : "role"}
            onClick={() => setRole("admin")}
          >
            <FaUserShield />
            <span>Admin</span>
          </button>

          <button
            className={role === "teacher" ? "role active" : "role"}
            onClick={() => setRole("teacher")}
          >
            <FaChalkboardTeacher />
            <span>Teacher</span>
          </button>

          <button
            className={role === "student" ? "role active" : "role"}
            onClick={() => setRole("student")}
          >
            <FaUserGraduate />
            <span>Student</span>
          </button>

          <button
            className={role === "parent" ? "role active" : "role"}
            onClick={() => setRole("parent")}
          >
            <FaUsers />
            <span>Parent</span>
          </button>
        </div>

        <div className="input-group">
          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);

              setErrors((prev) => ({
                ...prev,
                email: "",
                login: "",
              }));
            }}
          />

          {errors.email && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.email}
            </p>
          )}
        </div>

        <div className="input-group">
          <label>Password</label>

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  password: "",
                  login: "",
                }));
              }}
            />

            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.password && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.password}
            </p>
          )}
        </div>

        <div className="login-options">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        {lockTime > 0 ? (
        <p
            style={{
            color: "#ff9800",
            textAlign: "center",
            marginBottom: "15px",
            fontWeight: "bold",
            }}
        >
            Too many failed attempts. Try again in {lockTime} seconds.
        </p>
        ) : (
        errors.login && (
            <p
            style={{
                color: "red",
                textAlign: "center",
                marginBottom: "15px",
            }}
            >
            {errors.login}
            </p>
        )
        )}

        <button
        className="login-btn"
        onClick={handleLogin}
        disabled={loading || lockTime > 0}
        >
        {loading
            ? "Signing In..."
            : lockTime > 0
            ? `Try again in ${lockTime}s`
            : "Sign In"}
        </button>
      </div>
    </div>
  );
}

export default Login;