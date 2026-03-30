import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import AdminDashboard from "./pages/AdminDashboard";
import UserLogin from "./user/UserLogin";
import UserDashboard from "./pages/UserDashboard";
import UserSummary from "./pages/UserSummary";
import UserBenefits from "./pages/UserBenefits";
import AboutUs from "./pages/AboutUs";
import ApplyPWD from "./pages/ApplyPWD"; // 1. Import your new application page
import "./App.css";

/* =========================
    PRIVATE ROUTE COMPONENT
   ========================= */
const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem(role));
  return user ? (
    children
  ) : (
    <Navigate to={role === "admin" ? "/" : "/user-login"} />
  );
};

/* =========================
    ADMIN LOGIN COMPONENT
   ========================= */
function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("tbl_admin")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error || !data) {
        setMessage("Invalid Admin credentials.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("admin", JSON.stringify(data));
      navigate("/dashboard");
    } catch (error) {
      setMessage("Server connection failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <header>
          <h1>PWD Portal</h1>
          <p>Management System Access</p>
        </header>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Admin Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="button-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/user-login")}
          >
            Login as Beneficiary
          </button>

          {/* 2. Added the Online Application Button */}
          <button
            type="button"
            className="apply-btn"
            style={{ backgroundColor: '#28a745', color: 'white' }}
            onClick={() => navigate("/apply")}
          >
            New PWD Application
          </button>
        </div>

        {message && <div className="error-message">{message}</div>}
      </div>
    </div>
  );
}

/* =========================
    APP COMPONENT
   ========================= */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/overview" element={<AboutUs />} />
        
        {/* 3. Added the Public Application Route */}
        <Route path="/apply" element={<ApplyPWD />} />

        {/* Admin Protected Routes */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Beneficiary Protected Routes */}
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute role="beneficiary">
              <UserDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/user-benefits"
          element={
            <PrivateRoute role="beneficiary">
              <UserBenefits />
            </PrivateRoute>
          }
        />

        <Route
          path="/summary/:id"
          element={
            <PrivateRoute role="beneficiary">
              <UserSummary />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;