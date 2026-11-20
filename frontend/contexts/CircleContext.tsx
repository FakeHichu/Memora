import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase/client';
import { getBackendUrl, fetchWithTimeout } from '@/lib/photo-upload';
import type { ClassRecord } from '@/types/database';

const ACTIVE_CIRCLE_KEY = 'memora.unified_active_circle.v2';
const CIRCLES_CACHE_KEY = 'memora.unified_circles_cache.v2';

export interface UnifiedCircle {
  id: string;
  name: string;
  schoolName?: string | null;
  academicYear: number;
  joinCode?: string;
  description?: string | null;
  memberCount: number;
  createdAt: string;
  status: 'active' | 'archived';
}

interface CircleContextValue {
  // Active Circle (single source of truth)
  activeCircle: UnifiedCircle | null;
  circles: UnifiedCircle[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  selectCircle: (circleId: string) => Promise<void>;
  refreshCircles: () => Promise<void>;
  createCircle: (name: string, schoolName?: string, year?: number) => Promise<{ success: boolean; circle?: UnifiedCircle; message: string }>;
  joinCircle: (joinCode: string) => Promise<{ success: boolean; circle?: UnifiedCircle; message: string }>;
  leaveCircle: (circleId: string) => Promise<{ success: boolean; message: string }>;
  clearCircleCache: () => Promise<void>;
}

const CircleContext = createContext<CircleContextValue | undefined>(undefined);

function classRecordToUnifiedCircle(cls: ClassRecord): UnifiedCircle {
  return {
    id: cls.id,
    name: cls.name,
    schoolName: cls.school_name,
    academicYear: cls.academic_year,
    joinCode: cls.join_code,
    description: null,
    memberCount: cls.member_count || 1,
    createdAt: cls.created_at,
    status: cls.status,
  };
}

export function CircleProvider({ children }: { children: React.ReactNode }) {
  const [activeCircle, setActiveCircle] = useState<UnifiedCircle | null>(null);
  const [circles, setCircles] = useState<UnifiedCircle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCircles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedCircles: UnifiedCircle[] = [];
      
      // Try loading from cache first
      const cached = await AsyncStorage.getItem(CIRCLES_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) fetchedCircles = parsed;
        } catch {}
      }

      // Fetch from backend if authenticated
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const backendUrl = getBackendUrl();
          
          try {
            const response = await fetchWithTimeout(
              `${backendUrl}/api/classes`,
              {
                headers: {
                  Authorization: `Bearer ${sessionData.session.access_token}`,
                },
              },
              2500,
            );
            
            if (response.ok) {
              const result = await response.json();
              if (Array.isArray(result.classes)) {
                fetchedCircles = result.classes.map(classRecordToUnifiedCircle);
                await AsyncStorage.setItem(CIRCLES_CACHE_KEY, JSON.stringify(fetchedCircles));
              }
            }
          } catch (err) {
            console.warn('Failed to fetch circles from backend:', err);
          }
        }
      }

      setCircles(fetchedCircles);

      // Load or infer active circle
      const savedActiveId = await AsyncStorage.getItem(ACTIVE_CIRCLE_KEY);
      const matched = fetchedCircles.find((c) => c.id === savedActiveId) || fetchedCircles[0] || null;
      
      setActiveCircle(matched);
      
      if (matched && matched.id !== savedActiveId) {
        await AsyncStorage.setItem(ACTIVE_CIRCLE_KEY, matched.id);
      } else if (!matched && savedActiveId) {
        await AsyncStorage.removeItem(ACTIVE_CIRCLE_KEY);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load circles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCircles();
  }, [refreshCircles]);

  const selectCircle = useCallback(async (circleId: string) => {
    const matched = circles.find((c) => c.id === circleId);
    if (matched) {
      setActiveCircle(matched);
      await AsyncStorage.setItem(ACTIVE_CIRCLE_KEY, circleId);
      
      // Also notify backend
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const backendUrl = getBackendUrl();
          try {
            await fetch(`${backendUrl}/api/circles/active`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${sessionData.session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ circleId }),
            });
          } catch {
            // Non-fatal
          }
        }
      }
    }
  }, [circles]);

  const createCircle = useCallback(async (
    name: string,
    schoolName?: string,
    year?: number,
  ): Promise<{ success: boolean; circle?: UnifiedCircle; message: string }> => {
    try {
      if (!supabase) {
        return { success: false, message: 'Not authenticated' };
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        return { success: false, message: 'Not authenticated' };
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/classes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          schoolName: schoolName?.trim() || null,
          academicYear: year || new Date().getFullYear(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to create circle' };
      }

      const newCircle = classRecordToUnifiedCircle(result.class);
      await refreshCircles();
      await selectCircle(newCircle.id);

      return {
        success: true,
        circle: newCircle,
        message: 'Circle created successfully!',
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to create circle',
      };
    }
  }, [refreshCircles, selectCircle]);

  const joinCircle = useCallback(async (
    joinCode: string,
  ): Promise<{ success: boolean; circle?: UnifiedCircle; message: string }> => {
    const cleanCode = joinCode.trim().toUpperCase();
    
    try {
      if (!supabase) {
        return { success: false, message: 'Not authenticated' };
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        return { success: false, message: 'Not authenticated' };
      }

      const backendUrl = getBackendUrl();
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
        return { success: false, message: result.message || 'Failed to join circle' };
      }

      const joinedCircle = classRecordToUnifiedCircle(result.class);
      await refreshCircles();
      await selectCircle(joinedCircle.id);

      return {
        success: true,
        circle: joinedCircle,
        message: 'Successfully joined circle!',
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to join circle',
      };
    }
  }, [refreshCircles, selectCircle]);

  const clearCircleCache = useCallback(async () => {
    await AsyncStorage.removeItem(CIRCLES_CACHE_KEY);
    await AsyncStorage.removeItem(ACTIVE_CIRCLE_KEY);
    setCircles([]);
    setActiveCircle(null);
  }, []);

  const leaveCircle = useCallback(async (
    circleId: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!supabase) return { success: false, message: 'Not authenticated' };
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) return { success: false, message: 'Not authenticated' };

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/classes/${circleId}/leave`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to leave circle' };
      }
      await refreshCircles();
      return { success: true, message: 'You have left the circle.' };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to leave circle',
      };
    }
  }, [refreshCircles]);

  const value: CircleContextValue = {
    activeCircle,
    circles,
    isLoading,
    error,
    selectCircle,
    refreshCircles,
    createCircle,
    joinCircle,
    leaveCircle,
    clearCircleCache,
  };

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
}

export function useUnifiedCircle() {
  const context = useContext(CircleContext);
  if (!context) {
    throw new Error('useUnifiedCircle must be used within CircleProvider');
  }
  return context;
}
