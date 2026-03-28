import { createClient } from '@supabase/supabase-js';

// 統合DB (AsiaCFP Supabase)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seogpbjpabhmtmechtxr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlb2dwYmpwYWJobXRtZWNodHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDI1OTUsImV4cCI6MjA1ODI3ODU5NX0.kDcoHgsv2cC8DIhybxDSWV6fzi2YdIPo2bUzKyhKy3c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
