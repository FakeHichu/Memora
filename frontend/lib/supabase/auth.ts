import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from './client';

// Complete the browser session for OAuth
WebBrowser.maybeCompleteAuthSession();

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
    options: {
      data: { display_name: displayName },
      emailRedirectTo: 'http://localhost'
    },
  });
  return { data, error };
}

export async function signInWithGoogle() {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };

  try {
    // Create the redirect URI
    const redirectTo = makeRedirectUri({
      scheme: 'memora',
      path: 'auth/callback',
    });

    console.log('OAuth redirect URI:', redirectTo);

    // Start the OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      console.error('OAuth initialization error:', error);
      return { data: null, error };
    }

    if (!data?.url) {
      return { 
        data: null, 
        error: new Error('No authorization URL returned from Supabase') 
      };
    }

    // Open the OAuth URL in the browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    console.log('WebBrowser result:', result);

    if (result.type === 'cancel') {
      return { 
        data: null, 
        error: new Error('OAuth cancelled by user') 
      };
    }

    if (result.type === 'success' && result.url) {
      // Extract the URL parameters
      const url = new URL(result.url);
      const access_token = url.searchParams.get('access_token');
      const refresh_token = url.searchParams.get('refresh_token');

      if (access_token && refresh_token) {
        // Set the session using the tokens
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) {
          console.error('Session set error:', sessionError);
          return { data: null, error: sessionError };
        }

        return { data: sessionData, error: null };
      }
    }

    return { 
      data: null, 
      error: new Error('OAuth flow did not complete successfully') 
    };
  } catch (err) {
    console.error('OAuth error:', err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Unknown OAuth error') 
    };
  }
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
