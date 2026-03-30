import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./ApplyPWD.css";

const ApplyPWD = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  
  // 1. Expanded State to handle new fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    gender: "",
    age: "",
    dateOfBirth: "",
    disabilityType: "",
  });

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mockIpfsHash = "Qm" + Math.random().toString(36).substring(2, 15);
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Updated Insert Logic to include new fields
      const { error } = await supabase.from("pwd_applications").insert([
        {
          user_id: user?.id,
          status: "pending",
          doc_ipfs_hash: mockIpfsHash,
          first_name: formData.firstName,
          last_name: formData.lastName,
          disability_type: formData.disabilityType,
          // -- NEW FIELDS ADDED HERE --
          middle_name: formData.middleName,
          suffix: formData.suffix,
          gender: formData.gender,
          age: parseInt(formData.age), // Convert age to integer
          date_of_birth: formData.dateOfBirth,
        },
      ]);

      if (error) throw error;

      alert("Application submitted! Our admins will review your documents shortly.");
      navigate("/user-dashboard");
    } catch (error) {
      alert("Submission Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-wrapper">
      <div className="apply-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Portal
        </button>
        
        <div className="apply-header">
          <h2>Apply for PWD ID</h2>
          <p>Fill out your details. Fields marked with (*) are mandatory.</p>
        </div>

        <form onSubmit={handleSubmit} className="apply-form">
          
          {/* Row 1: First, Middle, Last Names */}
          <div className="form-row three-cols">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" required placeholder="Joshua" value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input type="text" placeholder="B." value={formData.middleName}
                onChange={(e) => setFormData({...formData, middleName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" required placeholder="Tolentino" value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>

          {/* Row 2: Suffix, Gender, Age */}
          <div className="form-row three-cols">
            <div className="form-group">
              <label>Suffix (Jr/Sr/III)</label>
              <input type="text" placeholder="N/A" value={formData.suffix}
                onChange={(e) => setFormData({...formData, suffix: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Age *</label>
              <input type="number" required placeholder="25" min="0" value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})} />
            </div>
          </div>

          {/* Row 3: DOB, Disability Category */}
          <div className="form-row two-cols">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" required value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Disability Category *</label>
              <select required value={formData.disabilityType} onChange={(e) => setFormData({...formData, disabilityType: e.target.value})}>
                <option value="">Choose an option...</option>
                <option value="Visual">Visual</option>
                <option value="Hearing">Hearing</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Intellectual">Intellectual</option>
                <option value="Psychosocial">Psychosocial</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Medical Documentation (Verification Proof)</label>
            <div className={`file-input-container ${file ? 'file-active' : ''}`}>
              <input type="file" accept="image/*,.pdf" required onChange={handleFileChange} />
              <div className="file-display">
                <span className="file-icon">{file ? "📄" : "📁"}</span>
                <span className="file-text">
                  {file ? file.name : "Click to upload medical proof"}
                </span>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting Application..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyPWD;