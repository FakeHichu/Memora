import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase/client';

const authStorageKey = 'memora.auth.session.v1';
const rememberMeStorageKey = 'memora.remember_me.v1';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(!!supabase);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isActive = true;

    // Restore session from Supabase (which uses AsyncStorage internally for session persistence)
    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return;
      setSession(data.session);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
    });

    // Restore Remember Me preference from AsyncStorage
    AsyncStorage.getItem(rememberMeStorageKey).then((storedValue) => {
      if (!isActive) return;
      if (storedValue === 'true') {
        setRememberMe(true);
      } else if (storedValue === 'false') {
        setRememberMe(false);
      } else {
        // Default: rememberMe is true (user wants to stay logged in)
        setRememberMe(true);
      }
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const setRememberMeState = (value: boolean) => {
    setRememberMe(value);
    AsyncStorage.setItem(rememberMeStorageKey, value.toString()).catch(() => undefined);
    // Note: Remember Me preference is persisted, but actual logout happens when user explicitly signs out
    // Supabase's persistSession:true handles automatic session restoration on app restart
  };

  const signInWithEmail = async (email: string, password: string) => {
    const supa = supabase!;
    const { data, error } = await supa.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    const supa = supabase!;
    const { data, error } = await supa.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: 'http://localhost:8081',
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const supa = supabase!;
    const { error } = await supa.auth.signOut();
    setSession(null);
    // If Remember Me is disabled, user won't auto-login next time
    // The checkbox state is informational; Supabase handles actual session persistence
    return { error };
  };

  return {
    session,
    isLoading,
    rememberMe,
    setRememberMe: setRememberMeState,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}