const SUPABASE_URL = "https://hbcsiyqnefiszabtkbgo.supabase.co/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiY3NpeXFuZWZpc3phYnRrYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTc2NjIsImV4cCI6MjA5NjI3MzY2Mn0.Jgvv6I-Wn83JfF8RzdZHRLyOFqHwY3-JvmJRQi2tXuM";

const client = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);