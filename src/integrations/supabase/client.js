// Supabase client – JS version
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '%c⚠️ Supabase is NOT configured.',
    'color: #e6a700; font-size: 14px; font-weight: bold;',
    '\n\n1. Copy  .env.example  →  .env',
    '\n2. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY',
    '\n3. Restart the dev server (npm run dev)',
    '\n\nUntil you do this, OAuth, patient registration, and all database features will fail silently.\n'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
