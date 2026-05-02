import { createClient } from '@supabase/supabase-js';

// Using process.env as requested by the user, and import.meta.env for Vite
const rawUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Remove quotes, whitespace, and ensure it is a string
const supabaseUrl = rawUrl.replace(/['"]+/g, '').trim();
const supabaseAnonKey = rawKey.replace(/['"]+/g, '').trim();

let clientInstance;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error("Supabase URL is invalid or missing. Ensure your Vercel Environment Variables are set correctly without extra quotes or spaces. Received URL:", rawUrl);
  
  // Dummy fallback object to prevent the entire React app from crashing downstream during destructuring/method calls
  clientInstance = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error('Invalid Supabase Config') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: async () => ({ data: null }), single: async () => ({ data: null }) }), insert: async () => ({ select: async () => ({ single: async () => ({ data: null }) }) }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
      delete: () => ({ eq: async () => ({ error: null }) }),
      insert: async () => ({ error: null })
    }),
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) })
  };
} else {
  clientInstance = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mesmer-auth-token', // 'Lock fix' to avoid lock:sb-auth-token errors
      }
    }
  );
}

export const supabase = clientInstance;
