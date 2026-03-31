require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('pwd_applications').select('*').order('id', { ascending: false }).limit(2);
  if (data && data.length > 0) {
    console.warn("==== START ====");
    data.forEach(item => {
      console.warn("ID:", item.id);
      console.warn("DOC_IPFS_HASH:", item.doc_ipfs_hash);
    });
    console.warn("==== END ====");
  }
}
check();
