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
    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return;
      setSession(data.session);
      setIsLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
    });
    AsyncStorage.getItem(rememberMeStorageKey).then((storedValue) => {
      if (!isActive) return;
      if (storedValue === 'true') {
        setRememberMe(true);
      } else if (storedValue === 'false') {
        setRememberMe(false);
      } else {
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
        emailRedirectTo: 'http://localhost'
      },
    });
    return { data, error };
  };
  const signOut = async () => {
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