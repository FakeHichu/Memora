import { supabase } from './client';

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  return { data, error };
}

export async function signOut() {
  if (!supabase) return { error: new Error('Supabase is not configured.') };

  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPasswordForEmail(email: string) {
  if (!supabase) return { error: new Error('Supabase is not configured.') };

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}
