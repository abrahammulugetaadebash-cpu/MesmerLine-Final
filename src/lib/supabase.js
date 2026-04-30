import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Ensure .env is configured correctly.');
}

export const supabase = createClient(
  supabaseUrl || 'https://sqdezzxbhrmaztropgwc.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGV6enhiaHJtYXp0cm9wZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjAxMjksImV4cCI6MjA5MzAzNjEyOX0.dg0s4tqRY8MGof4fx8_fiSQNkgbT1cw33dnkvW4hbDg',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
