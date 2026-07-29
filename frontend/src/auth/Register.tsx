import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiClient from "../api/client";
import "../styles/Login.css";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  register?: string;
};

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email address";
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({}); setLoading(true);
    try {
      const response = await apiClient.post("/api/auth/register", {
        name,
        email,
        password,
      });
      if (response.data?.success) {
        setSuccess(true);
      } else {
        setErrors({ register: response.data?.message || "Registration failed." });
      }
    } catch (err: any) {
      setErrors({
        register: "Self-registration is not available. Please contact the school administration to create your account."
      });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">SCHOOL</div>
            <h1 className="title">Registration Successful!</h1>
            <p className="subtitle">Your account has been created. Please check your email to confirm.</p>
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>Redirecting to login...</p>
            <Link to="/login" style={{ display: "inline-block", marginTop: "20px", color: "#4f46e5", fontWeight: 600 }}>Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">SCHOOL</div>
          <h1 className="title">School ERP</h1>
          <p className="subtitle">Create Your Account</p>
        </div>
        <form autoComplete="off" onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your name" value={name} onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: "", register: "" })); }} />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "", register: "" })); }} />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-container">
              <input type={showPassword ? "text" : "password"} placeholder="Password (min 6 chars)" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "", register: "" })); }} />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <div className="password-container">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: "", register: "" })); }} />
              <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>
          {errors.register && <p className="error-text login-error">{errors.register}</p>}
          <button className="login-btn" type="submit" disabled={loading}>{loading ? "Creating Account..." : "Sign Up"}</button>
        </form>
        <div className="login-options" style={{ justifyContent: "center", marginTop: "15px" }}>
          <Link to="/login" style={{ color: "#4f46e5", fontWeight: 600, fontSize: "14px" }}>Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
