import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqdezzxbhrmaztropgwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGV6enhiaHJtYXp0cm9wZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjAxMjksImV4cCI6MjA5MzAzNjEyOX0.dg0s4tqRY8MGof4fx8_fiSQNkgbT1cw33dnkvW4hbDg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
