require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

/* ==============================
    SUPABASE CONNECTION
============================== */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Connected to Supabase");

const PORT = process.env.PORT || 8081;

/* ==============================
    ADMIN LOGIN
============================== */
app.post("/login", async (req, res) => {
  let { username, password } = req.body;
  console.log("[ADMIN LOGIN] Attempt for:", username);

  const { data, error } = await supabase
    .from("tbl_admin")
    .select("*")
    .eq("username", username?.trim())
    .maybeSingle();

  if (error || !data || data.password !== password?.trim()) {
    return res.json({ success: false, message: "Invalid username or password" });
  }

  if (data.status !== "active") {
    return res.json({ success: false, message: "Account inactive" });
  }

  console.log(`[ADMIN LOGIN] Success: ${data.username}`);
  const { password: _, ...adminData } = data;
  res.json({ success: true, admin: adminData });
});

/* ==============================
    USER (BENEFICIARY) LOGIN
============================== */
app.post("/user/login", async (req, res) => {
  let { username, password } = req.body;
  console.log("[USER LOGIN] Attempt for:", username);

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  const { data, error } = await supabase
    .from("tbl_user_accounts")
    .select(`
      id, username, password, status,
      tbl_pwd ( id, firstname, lastname, id_number )
    `)
    .eq("username", username.trim())
    .maybeSingle();

  if (error) {
    console.error("[USER LOGIN] DB Error:", error.message);
    return res.status(500).json({ success: false, message: "Database error" });
  }

  if (!data || data.password !== password.trim()) {
    return res.json({ success: false, message: "Invalid username or password" });
  }

  if (data.status !== "active") {
    return res.json({ success: false, message: "Account is inactive" });
  }

  console.log("[USER LOGIN] Success for:", data.username);
  res.json({ success: true, user: data });
});

/* ==============================
    DASHBOARD DATA ROUTES
============================== */

// Fetch all PWDs
app.get("/api/beneficiaries", async (req, res) => {
  const { data, error } = await supabase.from("tbl_pwd").select("*").order('lastname');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// FETCH SINGLE BENEFICIARY (This was the missing piece!)
app.get("/api/beneficiaries/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Fetching details for Beneficiary ID: ${id}`);

  const { data, error } = await supabase
    .from("tbl_pwd")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ message: "Beneficiary not found" });
  }

  res.json(data);
});

/* ==============================
    FILE UPLOAD ROUTE
============================== */
app.post("/api/upload-id", async (req, res) => {
  try {
    const { fileName, base64Data, contentType } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ success: false, message: "Missing file data" });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload using service_role key to bypass RLS policies
    const { data, error } = await supabase.storage
      .from("id-pictures")
      .upload(fileName, buffer, { 
         contentType: contentType || 'image/jpeg',
         upsert: true
      });

    if (error) {
      console.error("[UPLOAD] DB Error:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("id-pictures")
      .getPublicUrl(fileName);

    res.json({ success: true, publicUrl: publicUrlData.publicUrl });
  } catch (error) {
    console.error("[UPLOAD] Server Error:", error);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
});

// Fetch all Admins
app.get("/api/admins", async (req, res) => {
  const { data, error } = await supabase.from("tbl_admin").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/* ==============================
    STAFF CRUD
============================== */

// Fetch all Staff
app.get("/api/staff", async (req, res) => {
  const { data, error } = await supabase.from("tbl_staff").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE NEW STAFF
app.post("/api/staff", async (req, res) => {
  const { firstname, lastname, username, password } = req.body;
  console.log("[API] Adding new staff:", username);

  const { data, error } = await supabase
    .from("tbl_staff")
    .insert([
      { 
        firstname, 
        lastname, 
        username, 
        password, 
        account_type: "STAFF",
        status: "active" 
      }
    ])
    .select();

  if (error) {
    console.error("Supabase Insert Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
});

// UPDATE STAFF (Added to fix your update issue)
app.put("/api/staff/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Updating staff ID: ${id}`);
  
  // Prevent primary key / read-only updates
  const { id: _id, created_at: _ca, ...updateData } = req.body;

  const { data, error } = await supabase
    .from("tbl_staff")
    .update(updateData)
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// DELETE STAFF (Added for completeness)
app.delete("/api/staff/:id", async (req, res) => {
  const { error } = await supabase.from("tbl_staff").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Dashboard Statistics
app.get("/api/dashboard-summary", async (req, res) => {
  const { count: total_pwd } = await supabase.from("tbl_pwd").select("*", { count: "exact", head: true });
  const { count: total_admin } = await supabase.from("tbl_admin").select("*", { count: "exact", head: true });
  const { count: total_staff } = await supabase.from("tbl_staff").select("*", { count: "exact", head: true });

  res.json({
    success: true,
    summary: { 
      total_pwd: total_pwd || 0, 
      total_admin: total_admin || 0, 
      total_staff: total_staff || 0 
    }
  });
});

/* ==============================
    BENEFICIARY CRUD
============================== */
// CREATE
app.post("/api/beneficiaries", async (req, res) => {
  const { data, error } = await supabase.from("tbl_pwd").insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// UPDATE
app.put("/api/beneficiaries/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Updating beneficiary ID: ${id}`);
  
  const { id: _id, created_at: _ca, ...updateData } = req.body;

  const { data, error } = await supabase
    .from("tbl_pwd")
    .update(updateData)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Update error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true, data });
});

// DELETE
app.delete("/api/beneficiaries/:id", async (req, res) => {
  const { error } = await supabase.from("tbl_pwd").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// APPROVE / REJECT ACTIONS
app.post("/api/beneficiaries/:id/:action", async (req, res) => {
  const { id, action } = req.params;
  const status = action === "approve" ? "Approved" : "Rejected";

  const { data, error } = await supabase
    .from("tbl_pwd")
    .update({ status: status })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

/* ==============================
    SERVER START
============================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});