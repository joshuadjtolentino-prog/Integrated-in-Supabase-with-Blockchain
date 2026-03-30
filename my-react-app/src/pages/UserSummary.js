import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Ensure your client is imported
import { QRCodeSVG } from "qrcode.react";
import "./UserSummary.css";

const UserSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Fetch individual user data where 'id' matches the URL param
        const { data, error } = await supabase
          .from("tbl_pwd")
          .select("*")
          .eq("id", id)
          .single(); // Use .single() since we only expect one record

        if (error) throw error;
        setUser(data);
      } catch (err) {
        console.error("Error fetching user details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserDetails();
  }, [id]);

  if (loading)
    return <div className="loading-state">Loading Beneficiary Profile...</div>;
  if (!user) return <div className="error-state">Beneficiary not found.</div>;

  // Data to be encoded in the QR code - using Supabase data
  const qrValue = `PWD-SYSTEM-${user.id}-${user.lastname}`;

  return (
    <div className="summary-wrapper">
      <div className="summary-controls">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Return to Dashboard
        </button>
      </div>

      <div className="summary-card">
        <div className="card-header">
          <h2>PWD Beneficiary Summary</h2>
          <p>Official System Record</p>
        </div>

        <div className="card-body">
          <div className="qr-section">
            <div className="qr-box">
              <QRCodeSVG
                value={qrValue}
                size={180}
                level={"H"}
                includeMargin={true}
              />
            </div>
            <span className="qr-hint">Scan for Verification</span>
          </div>

          <div className="details-section">
            <div className="detail-item">
              <label>Full Name</label>
              <div className="value">
                {`${user.firstname} ${user.middlename || ""} ${user.lastname} ${user.suffix || ""}`}
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <label>System ID</label>
                <div className="value">#{user.id}</div>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <div className="value">{user.gender}</div>
              </div>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <div
                className={`status-pill ${user.status?.toLowerCase() || "pending"}`}
              >
                {user.status || "Pending"}
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button className="print-btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSummary;
