import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Import Supabase client
import "./StaffManagement.css";

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    account_type: "staff",
  });
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_admin")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setStaffList(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error.message);
    }
  };

  const handleChange = (e) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  // Helper function to clean data
  const cleanData = (data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ]),
    );
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const cleanedData = cleanData(newStaff);
    try {
      setLoading(true);

      // Supabase Insert
      const { error } = await supabase.from("tbl_admin").insert([cleanedData]);

      if (error) throw error;

      alert("✅ Staff added successfully!");
      setNewStaff({
        firstname: "",
        lastname: "",
        username: "",
        password: "",
        account_type: "staff",
      });
      fetchStaff();
    } catch (error) {
      alert("❌ Failed to add staff: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    const cleanedData = cleanData(editingStaff);
    try {
      setLoading(true);

      // Supabase Update
      const { error } = await supabase
        .from("tbl_admin")
        .update({
          firstname: cleanedData.firstname,
          lastname: cleanedData.lastname,
          // Add other fields here if you want to allow editing username/password
        })
        .eq("id", editingStaff.id);

      if (error) throw error;

      alert("✅ Update successful!");
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      alert("❌ Failed to update: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Permanent delete this staff member?")) return;
    try {
      // Supabase Delete
      const { error } = await supabase.from("tbl_admin").delete().eq("id", id);

      if (error) throw error;
      fetchStaff();
    } catch (error) {
      console.error("Delete error:", error.message);
    }
  };

  return (
    <div className="staff-wrapper">
      <header className="staff-header">
        <div>
          <h2 className="page-title">Staff Directory</h2>
          <p className="page-subtitle">
            Manage administrative access and system roles.
          </p>
        </div>
      </header>

      <div className="staff-grid-layout">
        {/* ADD STAFF SIDE */}
        <div className="staff-card registration-side">
          <div className="card-header">
            <div className="icon-box">➕</div>
            <h3>Add New Staff</h3>
          </div>
          <form onSubmit={handleAddStaff} className="modern-staff-form">
            <div className="input-row">
              <div className="field">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={newStaff.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={newStaff.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={newStaff.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label>Initial Password</label>
              <input
                type="password"
                name="password"
                value={newStaff.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* LIST SIDE */}
        <div className="staff-card list-side">
          <div className="table-wrapper">
            <table className="modern-staff-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div className="staff-info">
                        <div className="avatar">
                          {staff.firstname?.[0]}
                          {staff.lastname?.[0]}
                        </div>
                        <span>
                          {staff.firstname} {staff.lastname}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="user-tag">{staff.username}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${staff.account_type}`}>
                        {staff.account_type || "staff"}
                      </span>
                    </td>
                    <td>
                      <div className="action-row">
                        <button
                          className="btn-icon edit"
                          onClick={() => setEditingStaff(staff)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingStaff && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Account</h3>
            <form onSubmit={handleUpdateStaff}>
              <div className="field">
                <label>First Name</label>
                <input
                  type="text"
                  value={editingStaff.firstname}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      firstname: e.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editingStaff.lastname}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      lastname: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-btns">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setEditingStaff(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
