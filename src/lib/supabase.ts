import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Strict validation: Check if keys exist AND are not default placeholders
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-url') &&
  supabaseUrl.length > 10;

// Safely create Supabase client or return null if env vars missing/invalid
export const supabase = isConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;
