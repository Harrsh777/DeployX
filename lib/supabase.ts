import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obepiriycoqzthcbmhsj.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZXBpcml5Y29xenRoY2JtaHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTU1NDQsImV4cCI6MjA1Nzk3MTU0NH0.hy3InRSMiIHOCeUFdW6do5dOMCkH2NgiUfhYNapSFME'; // Replace with your Supabase ANON key

export const supabase = createClient(supabaseUrl, supabaseKey);
