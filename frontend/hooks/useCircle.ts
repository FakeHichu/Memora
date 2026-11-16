import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getBackendUrl } from '@/lib/photo-upload';

const ACTIVE_CIRCLE_KEY = 'memora.active_circle.v1';
const CIRCLES_CACHE_KEY = 'memora.circles_cache.v1';

export interface Circle {
  id: string;
  class_id: string;
  name: string;
  description?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived';
  memberCount?: number;
}

export function useCircle() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCircles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let localCircles: Circle[] = [];
      
      // Try to load from cache first
      const cached = await AsyncStorage.getItem(CIRCLES_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) localCircles = parsed;
        } catch {}
      }

      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const backendUrl = getBackendUrl();
          try {
            const apiRes = await fetch(`${backendUrl}/api/circles`, {
              headers: {
                Authorization: `Bearer ${sessionData.session.access_token}`,
              },
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (Array.isArray(apiData.circles)) {
                localCircles = apiData.circles;
                await AsyncStorage.setItem(CIRCLES_CACHE_KEY, JSON.stringify(localCircles));
              }
            }
          } catch (err) {
            console.warn('Failed to fetch circles:', err);
          }
        }
      }

      setCircles(localCircles);

      // Load active circle
      const savedActiveId = await AsyncStorage.getItem(ACTIVE_CIRCLE_KEY);
      const matched = localCircles.find((c) => c.id === savedActiveId) || localCircles[0] || null;
      setActiveCircle(matched);
      
      if (matched && matched.id !== savedActiveId) {
        await AsyncStorage.setItem(ACTIVE_CIRCLE_KEY, matched.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load circles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCircles();
  }, [loadCircles]);

  const selectCircle = async (circleId: string) => {
    const matched = circles.find((c) => c.id === circleId);
    if (matched) {
      setActiveCircle(matched);
      await AsyncStorage.setItem(ACTIVE_CIRCLE_KEY, circleId);
      
      // Also update backend
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
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
          } catch {}
        }
      }
    }
  };

  const createCircle = async (
    classId: string,
    name: string,
    description?: string,
  ): Promise<{ success: boolean; circle?: Circle; message: string }> => {
    try {
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const backendUrl = getBackendUrl();
          const response = await fetch(`${backendUrl}/api/circles`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              classId,
              name: name.trim(),
              description: description?.trim() || null,
            }),
          });
          const result = await response.json();
          if (!response.ok) {
            return { success: false, message: result.message || 'Could not create circle.' };
          }
          
          // Refresh circles and set as active
          await loadCircles();
          if (result.circle?.id) {
            await selectCircle(result.circle.id);
          }
          
          return {
            success: true,
            circle: result.circle,
            message: 'Circle created successfully!',
          };
        }
      }
      return { success: false, message: 'Not authenticated' };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Could not create circle.',
      };
    }
  };

  const joinCircle = async (circleId: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const backendUrl = getBackendUrl();
          const response = await fetch(`${backendUrl}/api/circles/${circleId}/join`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });
          const result = await response.json();
          if (!response.ok) {
            return { success: false, message: result.message || 'Could not join circle.' };
          }
          await loadCircles();
          await selectCircle(circleId);
          return { success: true, message: 'Successfully joined circle!' };
        }
      }
      return { success: false, message: 'Not authenticated' };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error joining circle.',
      };
    }
  };

  const getActiveCircleFromServer = async (): Promise<Circle | null> => {
    try {
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const backendUrl = getBackendUrl();
          const response = await fetch(`${backendUrl}/api/circles/active`, {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });
          if (response.ok) {
            const result = await response.json();
            return result.circle || null;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  return {
    circles,
    activeCircle,
    isLoading,
    error,
    refreshCircles: loadCircles,
    selectCircle,
    createCircle,
    joinCircle,
    getActiveCircleFromServer,
  };
}
