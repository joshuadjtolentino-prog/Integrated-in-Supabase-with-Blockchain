import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://puvcjxrgvnuxdcnwgguc.supabase.co";
const supabaseKey = "sb_publishable_0TDmPe_G_yeeZN-ujX7bVg_CP4SSOA0";

export const supabase = createClient(supabaseUrl, supabaseKey);
