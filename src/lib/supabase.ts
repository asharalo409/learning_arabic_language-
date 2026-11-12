import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const ADMIN_EMAIL = 'taseenbillah407@gmail.com';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

const hasValidConfig =
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('MY_SUPABASE_URL') &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('MY_SUPABASE_ANON_KEY');

export const supabase: SupabaseClient | null = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

export function isAdminEmail(email?: string | null): boolean {
  return (email || '').trim().toLowerCase() === ADMIN_EMAIL;
}
