// /js/supabaseClient.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Reemplaza con tu URL y API Key (anon)
const SUPABASE_URL = 'https://wqpqggkcxbehoybkrsor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcHFnZ2tjeGJlaG95Ymtyc29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMjkwNTEsImV4cCI6MjA2MDYwNTA1MX0.phEEnTHd-bqJYKNVCx5CE33q4lk7fiFQ8MU_R3nbF_I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
