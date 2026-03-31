import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./ApplyPWD.css";

const ApplyPWD = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [idPicture, setIdPicture] = useState(null);
  const [idPicturePreview, setIdPicturePreview] = useState(null);
  
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

  const handleIdPictureChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setIdPicture(selectedFile);
      setIdPicturePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const toBase64 = (f) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
      });

      // Upload Medical Proof
      let medicalProofUrl = "Qm" + Math.random().toString(36).substring(2, 15); // Fallback mock hash
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `med-${user?.id || 'guest'}-${Date.now()}.${fileExt}`;
        const base64Data = await toBase64(file);

        const uploadResponse = await fetch("http://localhost:8081/api/upload-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: fileName,
            base64Data: base64Data,
            contentType: file.type
          })
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          medicalProofUrl = uploadResult.publicUrl;
        } else {
          throw new Error("Error uploading Medical Proof: " + uploadResult.message);
        }
      }

      // Upload ID Picture
      let imageUrl = null;
      if (idPicture) {
        const fileExt = idPicture.name.split('.').pop();
        const fileName = `id-${user?.id || 'guest'}-${Date.now()}.${fileExt}`;
        const base64Data = await toBase64(idPicture);

        const uploadResponse = await fetch("http://localhost:8081/api/upload-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: fileName,
            base64Data: base64Data,
            contentType: idPicture.type
          })
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResult.success) {
          throw new Error("Error uploading ID picture: " + uploadResult.message);
        }
          
        imageUrl = uploadResult.publicUrl;
      }

      // 2. Updated Insert Logic to include new fields
      const { error } = await supabase.from("pwd_applications").insert([
        {
          user_id: user?.id,
          status: "pending",
          doc_ipfs_hash: imageUrl ? `${medicalProofUrl}:::${imageUrl}` : medicalProofUrl,
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

          {/* 2x2 ID Picture Upload */}
          <div className="form-group">
            <label>2x2 ID Picture (Selfie) *</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2 mb-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center">
                {idPicturePreview ? (
                  <img src={idPicturePreview} alt="ID Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">No photo</span>
                )}
              </div>
              <div className="flex-1 w-full text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a clear photo showing your face
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  required 
                  onChange={handleIdPictureChange} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
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