import { createClient } from '@supabase/supabase-js';

// Using process.env as requested by the user, and import.meta.env for Vite
const rawUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Remove quotes, whitespace, and ensure it is a string
const supabaseUrl = rawUrl.replace(/['"]+/g, '').trim();
const supabaseKey = rawKey.replace(/['"]+/g, '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env vars missing at runtime');
}

export const supabase = (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) 
  ? createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'mesmer-auth-token', // 'Lock fix' to avoid lock:sb-auth-token errors
        }
      }
    )
  : null;
