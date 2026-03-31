require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('pwd_applications').select('*').order('id', { ascending: false }).limit(2);
  if (error) {
    console.error("DB Error:", error.message);
  } else {
    console.log("LATEST APPLICATIONS:", JSON.stringify(data, null, 2));
  }
}
check();
