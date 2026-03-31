import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://puvcjxrgvnuxdcnwgguc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dmNqeHJndm51eGRjbndnZ3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzY3NzksImV4cCI6MjA4ODk1Mjc3OX0.cuXU1IIxfTMGUUDzNpXqAUT8FiX1TK8WVNlTXumZAZc";

export const supabase = createClient(supabaseUrl, supabaseKey);
