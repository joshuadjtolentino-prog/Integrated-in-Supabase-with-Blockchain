import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaIdBadge,
  FaCertificate,
  FaUsersCog,
  FaSignOutAlt,
  FaClipboardList, // 1. Added icon for Applications
} from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { ethers } from "ethers";

import DashboardHome from "./DashboardHome";
import Beneficiaries from "./Beneficiaries";
import Certificates from "./Certificates";
import StaffManagement from "./StaffManagement";
import ApplicationsList from "./ApplicationsList"; // 2. Import your new component
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);

  // Initialize Blockchain Provider
  useEffect(() => {
    const initBlockchain = async () => {
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
        } catch (err) {
          console.error("Blockchain provider error:", err);
        }
      }
    };
    initBlockchain();
  }, []);

  // Load logged-in admin data
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: adminData, error: adminError } = await supabase
          .from("tbl_admin")
          .select("*");

        if (adminError) throw adminError;
        setAdmins(adminData || []);

        const { data: beneficiaryData, error: benError } = await supabase
          .from("tbl_pwd")
          .select("*");

        if (benError) throw benError;
        setBeneficiaries(beneficiaryData || []);
      } catch (error) {
        console.error("Error fetching Supabase data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (admin) fetchData();
  }, [admin]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/");
  };

  if (!admin) return null;
  if (loading) return <div className="loading-screen">Loading dashboard data...</div>;

  return (
    <div className="dashboard-container">
      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">PWD ID System</h2>

        <ul className="nav-menu">
          <li>
            <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <FaHome /> Dashboard
            </NavLink>
          </li>

          {/* 3. NEW APPLICATIONS SIDEBAR ITEM */}
          <li>
            <NavLink 
              to="/dashboard/applications" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <FaClipboardList /> Applications
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/beneficiaries" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <FaIdBadge /> Beneficiaries
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/certificates" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <FaCertificate /> Certificates
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/staffmanagement" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <FaUsersCog /> Staff Management
            </NavLink>
          </li>
        </ul>

        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <button className="sidebar-toggle" onClick={() => setSidebarOpen((prev) => !prev)}>☰</button>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-info">
            <h1>Welcome, {admin.firstname} {admin.lastname}</h1>
            <p>Account Type: <span className="role-tag">{admin.account_type}</span></p>
          </div>
        </header>

        <div className="dashboard-content">
          <Routes>
            <Route index element={<DashboardHome admins={admins} beneficiaries={beneficiaries} />} />
            
            {/* 4. NEW ROUTE FOR APPLICATIONS */}
            <Route path="applications" element={<ApplicationsList />} />

            <Route path="beneficiaries" element={<Beneficiaries beneficiaries={beneficiaries} setBeneficiaries={setBeneficiaries} />} />
            <Route path="certificates" element={<Certificates beneficiaries={beneficiaries} provider={provider} />} />
            <Route path="staffmanagement" element={<StaffManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;