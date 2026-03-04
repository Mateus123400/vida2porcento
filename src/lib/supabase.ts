import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qqzcecillsmkramgxokd.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxemNlY2lsbHNta3JhbWd4b2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjU0ODIsImV4cCI6MjA4ODE0MTQ4Mn0.KQPsGfw1dR2uybNNjbecQBgYFMtW5vaI92OU9Klihgw';

// Capture the hash or search query before createClient potentially clears it
export const isRecoveryInitial = typeof window !== 'undefined' &&
    (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery') || window.location.href.includes('type=recovery'));

export const supabase = createClient(supabaseUrl, supabaseKey);
