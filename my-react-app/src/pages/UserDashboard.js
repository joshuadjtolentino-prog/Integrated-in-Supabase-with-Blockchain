import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Ensure path is correct
import "./UserDashboard.css";

const UserDashboard = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get logged-in user info for the sidebar
  const loggedInUser = JSON.parse(localStorage.getItem("beneficiary"));

  useEffect(() => {
    // Redirect if not logged in
    if (!loggedInUser) {
      navigate("/user-login");
      return;
    }

    fetchBeneficiaries();
  }, [navigate]);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(false);
      const { data, error } = await supabase
        .from("tbl_pwd")
        .select("*")
        .order("lastname", { ascending: true });

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (err) {
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("beneficiary");
    navigate("/user-login");
  };

  const filteredBeneficiaries = beneficiaries.filter(
    (b) =>
      `${b.firstname} ${b.lastname}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (b.id_number &&
        b.id_number.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const stats = {
    total: beneficiaries.length,
    approved: beneficiaries.filter(
      (b) => b.status?.toLowerCase() === "approved",
    ).length,
    pending: beneficiaries.filter((b) => b.status?.toLowerCase() === "pending")
      .length,
  };

  if (loading)
    return <div className="loading-container">Fetching records...</div>;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-glass-container">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar-panel">
          <div className="profile-section">
            {/* Displaying first letter of logged-in user's name */}
            <div className="avatar-large">
              {loggedInUser?.firstname?.[0] || "M"}
            </div>
            <div className="title-group">
              <h2>Member Portal</h2>
              <p>Secure PWD Records Management</p>
            </div>
          </div>

          <button
            className="overview-nav-btn"
            onClick={() => navigate("/overview")}
            style={{ marginBottom: "10px" }}
          >
            <span className="icon">🌐</span>
            Website Overview
          </button>

          <button
            className="benefits-nav-btn"
            onClick={() => navigate("/user-benefits")}
          >
            <span className="icon">🎁</span>
            View My Benefits
          </button>

          <div className="stats-vertical">
            <div className="stat-card">
              <span className="stat-label">Total Records</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card highlight-success">
              <span className="stat-label">Approved</span>
              <span className="stat-value">{stats.approved}</span>
            </div>
            <div className="stat-card highlight-warning">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
          </div>

          <button className="logout-action" onClick={handleLogout}>
            Sign Out
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="content-panel">
          <header className="content-header">
            <h3>Registered Beneficiaries</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          <div className="table-scroll-area">
            <table className="modern-user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeneficiaries.length > 0 ? (
                  filteredBeneficiaries.map((user) => (
                    <tr key={user.id}>
                      <td className="id-tag">#{user.id}</td>
                      <td>
                        <div className="user-info">
                          <span className="name-bold">
                            {user.firstname} {user.lastname}
                          </span>
                          <span className="id-subtext">
                            {user.id_number || "PWD-TEMP"}
                          </span>
                        </div>
                      </td>
                      <td>{user.gender}</td>
                      <td>
                        <span
                          className={`status-badge ${user.status?.toLowerCase() || "pending"}`}
                        >
                          {user.status || "Pending"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="qr-action-btn"
                          onClick={() => navigate(`/summary/${user.id}`)}
                        >
                          View QR
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
