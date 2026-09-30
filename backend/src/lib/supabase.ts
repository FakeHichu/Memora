import { createClient } from '@supabase/supabase-js';

import { env } from '../config/env.js';

export const supabase = env.supabaseUrl && env.supabaseServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return supabase;
}
