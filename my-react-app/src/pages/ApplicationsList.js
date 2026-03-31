import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaCheck, FaTimes, FaUserAlt, FaFileMedical } from "react-icons/fa";
import "./ApplicationsList.css";

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pwd_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      alert("Error fetching applications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, newStatus) => {
    const confirmAction = window.confirm(`Are you sure you want to ${newStatus} this application?`);
    if (!confirmAction) return;

    try {
      // 1. Identify the specific application
      const appData = applications.find((app) => app.id === id);
      if (!appData) throw new Error("Application data not found.");

      // 2. If status is 'approved', migrate data to tbl_pwd
      if (newStatus === "approved") {
        const { error: insertError } = await supabase
          .from("tbl_pwd")
          .insert([
            {
              firstname: appData.first_name,
              lastname: appData.last_name,
              middlename: appData.middle_name,
              suffix: appData.suffix,
              gender: appData.gender,
              age: appData.age,
              birthdate: appData.date_of_birth, 
              disability_type: appData.disability_type,
              // CHANGED: Setting this to "Approved" to match your UI requirements
              status: "Approved", 
              id_number: `PWD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
            },
          ]);

        if (insertError) throw new Error("Error adding to Beneficiaries: " + insertError.message);
      }

      // 3. Update the original application status for the audit trail
      const { error: updateError } = await supabase
        .from("pwd_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;

      // 4. Update local state to refresh UI
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );

      alert(newStatus === "approved" ? "Application approved and beneficiary created!" : "Application rejected.");
    } catch (error) {
      console.error("Operation failed:", error);
      alert(error.message);
    }
  };

  if (loading) return <div className="loading-state">Loading submissions...</div>;

  return (
    <div className="applications-container">
      <header className="content-header">
        <h2>Incoming PWD Applications</h2>
        <p>Review and verify new submissions. Approved users are automatically added to the registry.</p>
      </header>

      <div className="apps-grid">
        {applications.length === 0 ? (
          <p className="no-data">No applications currently in the queue.</p>
        ) : (
          applications.map((app) => {
            const docs = app.doc_ipfs_hash ? app.doc_ipfs_hash.split(":::") : [];
            const docHash = docs[0] || "";
            const imgUrl = docs.length > 1 ? docs[1] : null;

            return (
              <div key={app.id} className={`app-card ${app.status}`}>
                <div className="app-info flex items-center gap-4">
                  {imgUrl ? (
                    <a href={imgUrl} target="_blank" rel="noreferrer" title="View Full ID Picture">
                      <img 
                        src={imgUrl} 
                        alt="Applicant ID" 
                        className="h-14 w-14 rounded-full object-cover border-2 border-blue-100 shadow-sm hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer"
                        style={{ width: '56px', height: '56px', minWidth: '56px' }}
                      />
                    </a>
                  ) : (
                    <div className="user-avatar w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <FaUserAlt size={20} />
                    </div>
                  )}
                  <div className="details m-0 p-0 flex-1">
                    <h4 className="m-0 text-lg font-bold text-gray-800">{app.first_name} {app.last_name} {app.suffix || ""}</h4>
                    <p className="m-0 text-gray-600 text-sm mt-1"><strong>Disability:</strong> {app.disability_type}</p>
                    <p className="text-sm mt-1 mb-1"><strong>Age:</strong> {app.age} | <strong>Gender:</strong> {app.gender}</p>
                    <p className="ipfs-link text-sm m-0">
                      <FaFileMedical className="inline mr-1" /> <a href={docHash.startsWith("http") ? docHash : `https://ipfs.io/ipfs/${docHash}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Medical Proof</a>
                    </p>
                  </div>
                </div>

              <div className="app-status">
                {/* UPDATED: Added a check for 'active' just in case old data exists */}
                <span className={`badge ${app.status === 'active' || app.status === 'approved' ? 'approved' : app.status}`}>
                  {app.status === 'active' ? 'Approved' : app.status}
                </span>
              </div>

              {app.status === "pending" && (
                <div className="app-actions">
                  <button onClick={() => handleAction(app.id, "approved")} className="btn-approve">
                    <FaCheck /> Approve
                  </button>
                  <button onClick={() => handleAction(app.id, "rejected")} className="btn-reject">
                    <FaTimes /> Reject
                  </button>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;