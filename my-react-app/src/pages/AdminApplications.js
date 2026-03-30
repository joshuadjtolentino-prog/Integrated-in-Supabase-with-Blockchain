import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./AdminDashboard.css"; // Create or update your CSS file

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications on component load
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pwd_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
    } else {
      setApplications(data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("pwd_applications")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      // Refresh the local list
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
    }
  };

  if (loading) return <div className="loader">Loading Applications...</div>;

  return (
    <div className="admin-container">
      <h1>PWD ID Applications</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Age/Gender</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{`${app.first_name} ${app.last_name}`}</td>
              <td>{app.disability_type}</td>
              <td>{app.age} / {app.gender}</td>
              <td>
                <span className={`status-badge ${app.status}`}>
                  {app.status}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => handleUpdateStatus(app.id, "approved")}
                  className="approve-btn"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleUpdateStatus(app.id, "rejected")}
                  className="reject-btn"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminApplications;