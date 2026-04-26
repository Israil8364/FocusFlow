import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing! Check your .env file.');
} else {
  console.log('🔌 Supabase Client Initializing with URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
