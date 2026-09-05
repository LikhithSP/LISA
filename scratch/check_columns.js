import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zqyoybzfvcncimbwmgcm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeW95YnpmdmNuY2ltYndtZ2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTMzNTksImV4cCI6MjA5ODU4OTM1OX0.6UxdhkN9ucV_4EjtzkM9mq2vhxPu3t7xe4CkY738JZE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profile data columns:", data.length > 0 ? Object.keys(data[0]) : "No data in profiles table");
  }
}
check();
