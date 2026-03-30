import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./DashboardHome.css";

const DashboardHome = () => {
  const [staff, setStaff] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          { data: sData, error: sError }, 
          { data: bData, error: bError },
          { data: aData, error: aError }
        ] = await Promise.all([
          supabase.from("tbl_admin").select("*"),
          supabase.from("tbl_pwd").select("*"),
          supabase.from("pwd_applications").select("*"),
        ]);

        if (sError) throw sError;
        if (bError) throw bError;
        if (aError) throw aError;

        setStaff(sData || []);
        setBeneficiaries(bData || []);
        setApplications(aData || []); 
      } catch (e) {
        console.error("Supabase Fetch error:", e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const adminAccounts = staff.filter(
    (s) => s.account_type === "admin" || s.account_type === "superadmin",
  );
  const staffAccounts = staff.filter((s) => s.account_type === "staff");
  const pendingApps = applications.filter((app) => app.status === "pending");

  if (loading)
    return (
      <div className="modern-loader">
        <div className="orbit"></div>
        <p>Architecting Dashboard...</p>
      </div>
    );

  return (
    <div className="bento-container">
      <div className="bg-gradient-blur"></div>

      <header className="bento-header">
        <div className="header-left">
          <span className="badge">Cloud Database Active</span>
          <h1>Insights <span>Platform</span></h1>
        </div>
      </header>

      <div className="bento-grid">
        {/* TOTAL BENEFICIARIES */}
        <div className="bento-card hero">
          <div className="card-info">
            <h3>Total Beneficiaries</h3>
            <p>Verified PWD entries in Supabase</p>
            <h2 className="massive-count">{beneficiaries.length}</h2>
          </div>
          <div className="card-visual">
            <div className="visual-circle"></div>
            <span className="visual-icon">👥</span>
          </div>
        </div>

        {/* PENDING APPLICATIONS */}
        <div className="bento-card stats-card highlight">
          <div className="card-info">
            <h3>New Applications</h3>
            <h2 className="stat-number" style={{ color: "#ffcc00" }}>
                {pendingApps.length}
            </h2>
          </div>
          <div className="card-footer">
            <span className="status-label pulse">● Action Required</span>
          </div>
        </div>

        {/* ADMINS */}
        <div className="bento-card stats-card">
          <div className="card-info">
            <h3>Admin Accounts</h3>
            <h2 className="stat-number">{adminAccounts.length}</h2>
          </div>
          <div className="card-footer">
            <span className="trend-up">↑ Full Access</span>
          </div>
        </div>

        {/* STAFF */}
        <div className="bento-card stats-card">
          <div className="card-info">
            <h3>Staff Members</h3>
            <h2 className="stat-number">{staffAccounts.length}</h2>
          </div>
          <div className="card-footer">
            <span className="status-label">Limited Access</span>
          </div>
        </div>

        {/* SYSTEM INTEGRITY */}
        <div className="bento-card stats-card wide">
          <div className="card-info">
            <h3>System Integrity</h3>
            <p>Data is being served directly from Supabase Cloud.</p>
          </div>
          <div className="system-health">
            <div className="health-bar">
              <div className="health-fill"></div>
            </div>
            <span>100% Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;