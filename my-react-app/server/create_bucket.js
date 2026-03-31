require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Use the existing keys from the server
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log("Attempting to create generic bucket 'id-pictures'...");
  const { data, error } = await supabase.storage.createBucket('id-pictures', {
    public: true,
  });

  if (error) {
    console.error("❌ Failed to create bucket:", error.message);
  } else {
    console.log("✅ Bucket created successfully:", data);
  }
}

createBucket();
