import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getBackendUrl } from '@/lib/photo-upload-v2';
import type { LocalPhotoPost } from '@/lib/photo-draft';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CircleFeedPost extends LocalPhotoPost {
  authorName?: string;
  authorAvatar?: string | null;
}

interface UseCircleFeedResult {
  posts: CircleFeedPost[];
  isLoading: boolean;
  error: string | null;
  refreshFeed: () => Promise<void>;
  hasNewPosts: boolean;
  loadNewPosts: () => void;
}

/**
 * Hook for loading and subscribing to Circle feed with real-time updates
 */
export function useCircleFeed(circleId: string | null): UseCircleFeedResult {
  const [posts, setPosts] = useState<CircleFeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [pendingPosts, setPendingPosts] = useState<CircleFeedPost[]>([]);

  const loadFeed = useCallback(async (showLoading: boolean = true) => {
    if (!circleId || !supabase) return;

    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/circles/${circleId}/feed`, {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load Circle feed');
      }

      const feedData = await response.json();
      const serverPosts: CircleFeedPost[] = (feedData.posts || []).map((p: any) => ({
        id: p.id,
        uri: p.photoUrl || p.photo_path,
        caption: p.caption || '',
        authorName: p.authorName || 'Classmate',
        authorAvatar: p.authorAvatar || null,
        category: 'General' as const,
        createdAt: p.created_at || new Date().toISOString(),
        reactions: p.reactionsMap || {},
        userReaction: p.userReaction || null,
      }));

      setPosts(serverPosts);
      setPendingPosts([]);
      setHasNewPosts(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, [circleId]);

  const refreshFeed = useCallback(async () => {
    await loadFeed(false);
  }, [loadFeed]);

  const loadNewPosts = useCallback(() => {
    if (pendingPosts.length > 0) {
      setPosts((prev) => [...pendingPosts, ...prev]);
      setPendingPosts([]);
      setHasNewPosts(false);
    }
  }, [pendingPosts]);

  // Initial load
  useEffect(() => {
    loadFeed(true);
  }, [loadFeed]);

  // Real-time subscription
  useEffect(() => {
    if (!circleId || !supabase) return;

    let channel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      if (!supabase) return;
      
      try {
        // Subscribe to new posts in this Circle
        channel = supabase
          .channel(`circle:${circleId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'circle_posts',
              filter: `circle_id=eq.${circleId}`,
            },
            async (payload) => {
              console.log('New Circle post detected:', payload.new);

              // Fetch full post details including author info
              try {
                if (!supabase) return;
                
                const { data: sessionData } = await supabase.auth.getSession();
                if (!sessionData?.session) return;

                const backendUrl = getBackendUrl();
                const response = await fetch(
                  `${backendUrl}/api/circles/${circleId}/feed`,
                  {
                    headers: {
                      Authorization: `Bearer ${sessionData.session.access_token}`,
                    },
                  }
                );

                if (response.ok) {
                  const feedData = await response.json();
                  const newPost = feedData.posts.find(
                    (p: any) => p.id === (payload.new as any).id
                  );

                  if (newPost) {
                    const formattedPost: CircleFeedPost = {
                      id: newPost.id,
                      uri: newPost.photoUrl || newPost.photo_path,
                      caption: newPost.caption || '',
                      authorName: newPost.authorName || 'Classmate',
                      authorAvatar: newPost.authorAvatar || null,
                      category: 'General' as const,
                      createdAt: newPost.created_at || new Date().toISOString(),
                      reactions: newPost.reactionsMap || {},
                      userReaction: newPost.userReaction || null,
                    };

                    // Add to pending posts instead of directly to feed
                    setPendingPosts((prev) => [formattedPost, ...prev]);
                    setHasNewPosts(true);
                  }
                }
              } catch (err) {
                console.error('Failed to fetch new post details:', err);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'circle_posts',
              filter: `circle_id=eq.${circleId}`,
            },
            (payload) => {
              console.log('Circle post deleted:', payload.old);
              const deletedId = (payload.old as any).id;
              setPosts((prev) => prev.filter((p) => p.id !== deletedId));
              setPendingPosts((prev) => prev.filter((p) => p.id !== deletedId));
            }
          )
          .subscribe((status) => {
            console.log('Circle feed subscription status:', status);
          });
      } catch (err) {
        console.error('Failed to setup real-time subscription:', err);
      }
    };

    setupRealtime();

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [circleId]);

  return {
    posts,
    isLoading,
    error,
    refreshFeed,
    hasNewPosts,
    loadNewPosts,
  };
}
