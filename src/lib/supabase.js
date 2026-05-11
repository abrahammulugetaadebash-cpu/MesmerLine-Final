import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = "https://sqdezzxbhrmaztropgwc.supabase.co"
const supabaseAnonKey = "sb_publishable_5WpJOiUfHz9sz-9m7exs_g_7N3PSaDk"

// Diagnostic Logging for Production
console.log('--- Supabase Diagnostic ---');
console.log('URL Defined:', !!supabaseUrl);
console.log('URL Length:', supabaseUrl?.length || 0);
console.log('Key Defined:', !!supabaseAnonKey);
console.log('Key Length:', supabaseAnonKey?.length || 0);
console.log('---------------------------');

/**
 * Supabase client instance.
 * Returns null if environment variables are missing to prevent downstream crashes.
 */
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase Error: Environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing.');
    return null;
  }
  
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Supabase Client Initialization Failed:', error);
    return null;
  }
})();
