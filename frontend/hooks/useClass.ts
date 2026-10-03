import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import type { ClassRecord } from '@/types/database';

const CLASSES_STORAGE_KEY = 'memora.classes.v1';
const ACTIVE_CLASS_KEY = 'memora.active_class_id.v1';

export function useClass() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [activeClass, setActiveClass] = useState<ClassRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Load locally saved classes
      let localClasses: ClassRecord[] = [];
      const stored = await AsyncStorage.getItem(CLASSES_STORAGE_KEY);
      if (stored) {
        try {
          localClasses = JSON.parse(stored) as ClassRecord[];
        } catch {
          // ignore parsing error
        }
      }

      // 2. If Supabase is available & logged in, fetch from backend/Supabase
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const { data: memberRows, error: memberErr } = await supabase
            .from('class_members')
            .select('class_id, classes (*)')
            .eq('user_id', sessionData.session.user.id);

          if (!memberErr && memberRows) {
            const fetched = memberRows
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((row: any) => row.classes as ClassRecord)
              .filter(Boolean);

            if (fetched.length > 0) {
              localClasses = fetched;
              await AsyncStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(localClasses));
            }
          }
        }
      }

      setClasses(localClasses);

      // Determine active class
      const savedActiveId = await AsyncStorage.getItem(ACTIVE_CLASS_KEY);
      const matched = localClasses.find((c) => c.id === savedActiveId) || localClasses[0] || null;
      setActiveClass(matched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load classes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectClass = async (classId: string) => {
    const matched = classes.find((c) => c.id === classId);
    if (matched) {
      setActiveClass(matched);
      await AsyncStorage.setItem(ACTIVE_CLASS_KEY, classId);
    }
  };

  const joinClass = async (joinCode: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid join code.' };
    }

    try {
      // If connected to Supabase & backend
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const backendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:4000';
          const response = await fetch(`${backendUrl}/api/classes/join`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ joinCode: cleanCode }),
          });

          const result = await response.json();
          if (!response.ok) {
            return { success: false, message: result.message || 'Could not join class.' };
          }

          await loadClasses();
          return { success: true, message: 'Successfully joined class!' };
        }
      }

      // Offline / Local fallback: match against known sample class or create mock joined class
      const mockClass: ClassRecord = {
        id: `mock-${Date.now()}`,
        name: `Class (${cleanCode})`,
        school_name: 'Community Cohort',
        academic_year: new Date().getFullYear(),
        join_code: cleanCode,
        created_by: 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        member_count: 1,
      };

      const updated = [mockClass, ...classes];
      setClasses(updated);
      setActiveClass(mockClass);
      await AsyncStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(updated));
      await AsyncStorage.setItem(ACTIVE_CLASS_KEY, mockClass.id);

      return { success: true, message: 'Joined class locally!' };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error joining class.',
      };
    }
  };

  const createClassLocally = async (
    name: string,
    schoolName?: string,
    year?: number,
  ): Promise<ClassRecord> => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const joinCode = `MEM-${randomHex}`;

    const newClass: ClassRecord = {
      id: `class-${Date.now()}`,
      name: name.trim(),
      school_name: schoolName?.trim() || null,
      academic_year: year || new Date().getFullYear(),
      join_code: joinCode,
      created_by: 'local-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      member_count: 1,
    };

    const updated = [newClass, ...classes];
    setClasses(updated);
    setActiveClass(newClass);
    await AsyncStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(ACTIVE_CLASS_KEY, newClass.id);

    return newClass;
  };

  return {
    classes,
    activeClass,
    classId: activeClass?.id ?? null,
    isLoading,
    error,
    refreshClasses: loadClasses,
    selectClass,
    joinClass,
    createClassLocally,
  };
}
