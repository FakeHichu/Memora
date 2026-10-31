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
      // isLoading already set to false above; just return
      return;
    }

    let isActive = true;

    // Restore session from Supabase (which uses AsyncStorage internally for session persistence)
    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return;
      setSession(data.session);
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
        // Default: rememberMe is false; let Supabase session persistence handle it
        setRememberMe(false);
      }
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const setRememberMeState = (value: boolean) => {
    setRememberMe(value);
    AsyncStorage.setItem(rememberMeStorageKey, value.toString()).catch(() => undefined);
    if (value) {
      // Remember Me enabled - Supabase persistSession will handle session retention
      // No extra action needed; the session persists across app restarts via Supabase's AsyncStorage
    } else {
      // Remember Me disabled - clear stored session so user is logged out on restart
      AsyncStorage.removeItem(authStorageKey).then(() => {
        // Also sign out from Supabase if currently authenticated
        supabase?.auth.signOut().then(() => {
          setSession(null);
        }).catch(() => {});
      });
    }
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
    // If Remember Me is disabled, clear stored session so user is logged out on restart
    if (!rememberMe) {
      await AsyncStorage.removeItem(authStorageKey);
    }
    const supa = supabase!;
    const { error } = await supa.auth.signOut();
    setSession(null);
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