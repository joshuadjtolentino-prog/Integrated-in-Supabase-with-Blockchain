import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Beneficiaries.css";

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  
  const [step, setStep] = useState(1);
  const [targetId, setTargetId] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "", lastname: "", middlename: "", suffix: "",
    gender: "", age: "", birthdate: "", disability_type: "", id_number: "",
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tbl_pwd")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const newStatus = action === "approve" ? "Approved" : "Rejected";
    try {
      const { error } = await supabase.from("tbl_pwd").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      fetchBeneficiaries();
    } catch (err) {
      console.error("Action failed:", err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this record? This will also remove their certificate.")) return;
    
    try {
      setLoading(true);

      // 1. Delete associated certificates first (to avoid Foreign Key constraint errors)
      const { error: certError } = await supabase
        .from("tbl_certificates")
        .delete()
        .eq("beneficiary_id", id);

      if (certError) throw certError;

      // 2. Now delete the beneficiary from tbl_pwd
      const { error: pwdError } = await supabase
        .from("tbl_pwd")
        .delete()
        .eq("id", id);

      if (pwdError) throw pwdError;

      // 3. Refresh the UI
      fetchBeneficiaries();
      alert("Record deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err.message);
      alert("Delete failed: " + err.message + ". Check your Supabase RLS policies for DELETE permission.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value === "" ? null : value])
    );

    try {
      if (editing) {
        const { error } = await supabase.from("tbl_pwd").update(cleanedData).eq("id", editing);
        if (error) throw error;
        setTargetId(editing);
        setStep(2);
      } else {
        const { data, error } = await supabase
          .from("tbl_pwd")
          .insert([{ ...cleanedData, status: "Pending" }])
          .select().single();

        if (error) throw error;
        setTargetId(data.id);
        setStep(2);
      }
      fetchBeneficiaries();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${targetId}-${Date.now()}.${fileExt}`;

      const { error: upErr } = await supabase.storage
        .from("certificates")
        .upload(`uploads/${fileName}`, file);
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(`uploads/${fileName}`);

      const { data: existingCert } = await supabase
        .from("tbl_certificates")
        .select("id")
        .eq("beneficiary_id", targetId)
        .single();

      if (existingCert) {
        const { error: dbErr } = await supabase
          .from("tbl_certificates")
          .update({ certificate_url: urlData.publicUrl, is_synced: false })
          .eq("id", existingCert.id);
        if (dbErr) throw dbErr;
      } else {
        const { error: dbErr } = await supabase.from("tbl_certificates").insert([
          { beneficiary_id: targetId, certificate_url: urlData.publicUrl, is_synced: false }
        ]);
        if (dbErr) throw dbErr;
      }

      alert("Success!");
      resetForm();
    } catch (err) {
      alert("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEditing(null);
    setTargetId(null);
    setFile(null);
    setFormData({
      firstname: "", lastname: "", middlename: "", suffix: "",
      gender: "", age: "", birthdate: "", disability_type: "", id_number: "",
    });
    fetchBeneficiaries();
  };

  const handleEdit = (b) => {
    setEditing(b.id);
    setStep(1);
    setFormData({
      firstname: b.firstname || "",
      lastname: b.lastname || "",
      middlename: b.middlename || "",
      suffix: b.suffix || "",
      gender: b.gender || "",
      age: b.age || "",
      birthdate: b.birthdate ? b.birthdate.split("T")[0] : "",
      disability_type: b.disability_type || "",
      id_number: b.id_number || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredBeneficiaries = beneficiaries.filter(b =>
    `${b.firstname || ''} ${b.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="beneficiaries-wrapper">
      <header className="page-header">
        <h2 className="page-title">Beneficiary Management</h2>
        <div className="search-bar">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </header>

      {/* FORM SECTION */}
      <div className="form-card">
        <h3>{step === 1 ? (editing ? "✏️ Edit PWD" : "➕ New PWD") : "📄 Upload Certificate"}</h3>
        
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="beneficiary-form">
            <div className="input-grid">
              <input type="text" placeholder="First Name *" value={formData.firstname} onChange={(e) => setFormData({...formData, firstname: e.target.value})} required />
              <input type="text" placeholder="Last Name *" value={formData.lastname} onChange={(e) => setFormData({...formData, lastname: e.target.value})} required />
              <input type="text" placeholder="Middle Name" value={formData.middlename} onChange={(e) => setFormData({...formData, middlename: e.target.value})} />
              <input type="text" placeholder="Suffix" value={formData.suffix} onChange={(e) => setFormData({...formData, suffix: e.target.value})} />
              <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} required>
                <option value="">Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required />
              <input type="date" value={formData.birthdate} onChange={(e) => setFormData({...formData, birthdate: e.target.value})} required />
              <input type="text" placeholder="Disability" value={formData.disability_type} onChange={(e) => setFormData({...formData, disability_type: e.target.value})} required />
              <input type="text" placeholder="ID Number" value={formData.id_number} onChange={(e) => setFormData({...formData, id_number: e.target.value})} required />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">{editing ? "Update & Next" : "Save & Next"}</button>
              {editing && <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        ) : (
          <div className="step-two-container">
            <div className="upload-header">
              <p>Upload Certificate for:</p>
              <span className="target-name">{formData.firstname} {formData.lastname}</span>
            </div>

            <div 
              className={`dropzone ${file ? 'file-selected' : ''}`} 
              onClick={() => document.getElementById("file-input").click()}
            >
              <input 
                type="file" 
                id="file-input" 
                hidden 
                onChange={(e) => setFile(e.target.files[0])} 
                accept="image/*" 
              />
              
              <div className="upload-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div className="upload-text-content">
                <p className="main-text">{file ? file.name : "Click to select image"}</p>
                {!file && <p className="sub-text">PNG, JPG, or PDF up to 10MB</p>}
              </div>
            </div>

            <div className="form-actions centered">
              <button onClick={handleFileUpload} className="btn-save" disabled={uploading}>
                {uploading ? "Saving..." : "Finish"}
              </button>
              <button onClick={resetForm} className="btn-cancel">Skip</button>
            </div>
          </div>
        )}
      </div>

      {/* TABLE SECTION */}
      <div className="table-card">
        {loading ? (
           <div className="loading-state">Refreshing Database...</div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID Number</th>
                <th>Full Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeneficiaries.map((b) => (
                <tr key={b.id}>
                  <td className="bold">{b.id_number || "---"}</td>
                  <td>
                    <span className="main-name">
                      {`${b.firstname || ''} ${b.lastname || ''}`.trim() || "Name Missing"}
                    </span>
                  </td>
                  <td><span className={`status-pill ${b.status?.toLowerCase()}`}>{b.status || "Pending"}</span></td>
                  <td className="actions-cell">
                    {b.status === "Pending" && (
                      <button className="icon-btn approve" onClick={() => handleAction(b.id, "approve")}>Approve</button>
                    )}
                    <div className="edit-delete-row">
                      <button className="text-btn" onClick={() => handleEdit(b)}>Edit</button>
                      <button className="text-btn delete" onClick={() => handleDelete(b.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Beneficiaries;