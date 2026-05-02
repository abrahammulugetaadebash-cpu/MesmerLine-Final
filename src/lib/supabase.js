import { createClient } from '@supabase/supabase-js';

console.log('VITE_URL_EXISTS:', !!(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL));

const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  if (typeof window !== 'undefined' && window.ENV_VARS && window.ENV_VARS[key]) return window.ENV_VARS[key];
  return '';
};

const rawUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

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
