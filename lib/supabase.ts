import { createClient } from '@supabase/supabase-js';

// 統合DB (RE-IDEA Unified Supabase)
const supabaseUrl = 'https://seogpbjpabhmtmechtxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlb2dwYmpwYWJobXRtZWNodHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDI1OTUsImV4cCI6MjA1ODI3ODU5NX0.kDcoHgsv2cC8DIhybxDSWV6fzi2YdIPo2bUzKyhKy3c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
