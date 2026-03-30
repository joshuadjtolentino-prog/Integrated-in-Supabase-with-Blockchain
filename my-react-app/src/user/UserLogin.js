import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Ensure the path to your client is correct
import "./UserLogin.css";

const UserLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Query the tbl_user_accounts table in Supabase
      const { data, error } = await supabase
        .from("tbl_user_accounts")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single(); // We expect exactly one user

      // 2. Handle Errors or No User Found
      if (error || !data) {
        setMessage("Invalid username or password");
        setLoading(false);
        return;
      }

      // 3. Success! Store user data in localStorage as 'beneficiary'
      // This matches the 'role' your PrivateRoute is looking for in App.js
      localStorage.setItem("beneficiary", JSON.stringify(data));

      // 4. Redirect to the User Dashboard
      navigate("/user-dashboard");
    } catch (error) {
      setMessage(
        "Unable to connect to Supabase. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-glass-card">
        <div className="login-brand">
          <div className="logo-placeholder">PWD</div>
          <h1>Member Access</h1>
          <p>Sign in to manage your benefits and certificates</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="floating-input">
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. juandelacruz"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="floating-input">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && <div className="login-alert">{message}</div>}

          <button
            className={`auth-submit ${loading ? "busy" : ""}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <button className="text-nav-link" onClick={() => navigate("/")}>
            Are you staff? <span>Admin Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
