import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useClass } from '@/hooks/useClass';
import { useAppTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/lib/supabase/client';

export default function DiscoverScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const { session } = useAuth();
  const { classes, activeClass, isLoading: isClassLoading, selectClass } = useClass();
  const [posts, setPosts] = useState<Array<{
    id: string;
    photoUrl?: string;
    authorName?: string;
    reactionsMap?: Record<string, number>;
    userReaction?: string | null;
    comments?: Array<{ id: string; content: string; authorName: string }>;
    caption: string;
    location: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    async function fetchPosts() {
      if (!supabase || !session?.session?.user?.id) {
        if (isActive) setPosts([]);
        return;
      }

      const userId = session.session.user.id;
      let classIds: string[] = [];

      // Get all classes the user is a member of
      if (supabase) {
        const { data: memberRows, error: memberErr } = await supabase
          .from('class_members')
          .select('class_id')
          .eq('user_id', userId);

        if (!memberErr && memberRows) {
          classIds = memberRows.map((row: any) => row.class_id);
        }
      }

      // Also include the active class if it exists
      if (activeClass?.id && !classIds.includes(activeClass.id)) {
        classIds.push(activeClass.id);
      }

      if (isActive && classIds.length > 0) {
        // Fetch daily posts from all the user's classes
        const { data, error } = await supabase
          .from('daily_posts')
          .select(
            `*, 
             reactions (*), 
             profiles:user_id (display_name, username, avatar_path), 
             comments (*, profiles:user_id (display_name, username, avatar_path), comments (*))`
          )
          .in('class_id', classIds)
          .order('created_at', { ascending: false });

        if (!error && isActive) {
          const formatted = data?.map((post: any) => {
            let photoUrl: string | undefined;
            try {
              photoUrl = post.photo_path;
            } catch {
              photoUrl = post.photo_path;
            }
            const reactions = post.reactions || [];
            const reactionsMap: Record<string, number> = {};
            let userReaction: string | null = null;
            for (const r of reactions) {
              reactionsMap[r.reaction_type] = (reactionsMap[r.reaction_type] || 0) + 1;
              if (r.user_id === userId) {
                userReaction = r.reaction_type;
              }
            }
            const authorProfile = post.profiles;
            const authorName =
              authorProfile?.display_name || authorProfile?.username || 'Classmate';

            // Get comments for this post
            const comments = post.comments
              ? post.comments.map((c: any) => ({
                  id: c.id,
                  content: c.content,
                  authorName:
                    c.profiles?.display_name || c.profiles?.username || "Classmate",
                }))
              : [];

            return {
              id: post.id,
              photoUrl,
              authorName,
              reactionsMap,
              userReaction,
              comments,
              caption: post.caption || '',
              location: post.location || '',
            };
          }) || [];

          if (isActive) setPosts(formatted);
        }
      } else if (isActive) {
        if (isActive) setPosts([]);
      }
    }

    fetchPosts();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isActive) return;
        setIsLoading(true);
        fetchPosts();
      }
    );

    // Listen for class membership changes
    const { data: classListener } = supabase
      .from('class_members')
      .on('*', (_event: any, newRow: any) => {
        if (!isActive) return;
        setIsLoading(true);
        fetchPosts();
      })
      .eq('user_id', session?.session?.user?.id || '')
      .subscribe();

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
      if (classListener) classListener.unsubscribe();
    };
  }, [session, activeClass, supabase, normalizedQuery]);

  const filteredPosts = posts.filter((post) =>
    `${post.caption} ${post.location} ${post.authorName}`.toLowerCase().includes(normalizedQuery)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>MEMORA</Text>
            <Text style={styles.title}>Find your people.</Text>
          </View>
          <Text style={styles.headerMark}>DISCOVER</Text>
        </View>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search moments, people, places"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search preview people and moments"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>A PLACE TO START</Text>
            <Text style={styles.sectionTitle}>Trending memories</Text>
          </View>
          <Text style={styles.sectionArrow}>↗</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicRail}>
          {filteredPosts.length ? filteredPosts.map((post, index) => (
            <Pressable key={post.id} onPress={() => setQuery(post.caption)} style={[styles.topicCard, { backgroundColor: mode === 'dark' ? colors.surface : colors.background }]} accessibilityRole="button" accessibilityLabel={`${post.caption}, preview`}>
              <Text style={styles.topicIndex}>0{index + 1} / PREVIEW</Text>
              <View style={styles.topicShape}><Text style={styles.topicShapeText}>{index === 0 ? '✳' : index === 1 ? '◌' : '⌁'}</Text></View>
              <Text style={styles.topicTitle}>{post.caption}</Text>
              <Text style={styles.topicCount}>{post.location || ''}</Text>
            </Pressable>
          )) : <Text style={styles.noResults}>No moments match that search.</Text>}
        </ScrollView>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>PEOPLE TO REMEMBER</Text>
            <Text style={styles.sectionTitle}>People you may know</Text>
          </View>
          <Text style={styles.sampleTag}>SAMPLE</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRail}>
          {/* Placeholder - people would come from a different query */}
        </ScrollView>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>A MOMENT FROM THE COMMUNITY</Text>
            <Text style={styles.sectionTitle}>Recent moments</Text>
          </View>
        </View>
        {isLoading ? (
          <View style={styles.loadingState}>
            <Text>Loading community moments…</Text>
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={styles.noResults}>No moments match that search.</Text>
          </View>
        ) : (
          <View style={styles.feedPosts}>
            {filteredPosts.map((post) => (
              <View key={post.id} style={styles.feature}>
                <Image source={{ uri: post.photoUrl || '/assets/placeholder.jpg' }} style={styles.featureImage} resizeMode="cover" accessibilityLabel={post.caption} />
                <View style={styles.featureShade} />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTag}>Community Moment</Text>
                  <Text style={styles.featureTitle}>{post.caption}</Text>
                  <Text style={styles.featureMeta}>{post.authorName}  ·  {post.location || ''}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={styles.communityNote}>
          <Text style={styles.communityGlyph}>⌂</Text>
          <View style={styles.communityCopy}>
            <Text style={styles.communityTitle}>Your private class community</Text>
            <Text style={styles.communityMessage}>Discovery shows verified class membership moments when connected.</Text>
          </View>
          <Text style={styles.communityArrow}>›</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { minHeight: 74, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { ...typography.title, color: colors.text, marginTop: spacing.xs },
  headerMark: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  searchWrap: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  searchIcon: { color: colors.primaryDark, fontSize: 24, lineHeight: 28 },
  searchInput: { flex: 1, minWidth: 0, height: 48, color: colors.text, fontSize: 14 },
  clearSearch: { color: colors.muted, fontSize: 24 },
  previewNotice: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  previewDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  previewNoticeText: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.xs },
  eyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  sectionTitle: { ...typography.subheading, color: colors.text, marginTop: 2 },
  sectionArrow: { color: colors.primary, fontSize: 22 },
  topicRail: { gap: spacing.md, paddingRight: spacing.lg },
  topicCard: { width: 188, height: 166, justifyContent: 'space-between', overflow: 'hidden', padding: spacing.md, borderRadius: radius.lg },
  topicIndex: { color: 'rgba(244,242,250,0.62)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  topicShape: { position: 'absolute', top: 34, right: 14, width: 78, height: 78, alignItems: 'center', justifyContent: 'center', borderRadius: 39, backgroundColor: 'rgba(146,225,232,0.1)' },
  topicShapeText: { color: colors.accent, fontSize: 48, lineHeight: 56 },
  topicTitle: { maxWidth: 130, color: colors.text, fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  topicCount: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  peopleRail: { gap: spacing.lg, paddingRight: spacing.lg },
  noResults: { paddingVertical: spacing.lg, color: colors.muted, fontSize: 13 },
  loadingState: { paddingVertical: spacing.xxl, alignItems: 'center', paddingHorizontal: spacing.lg },
  feature: { height: 270, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.surface },
  featureImage: { width: '100%', height: '100%' },
  featureShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,9,15,0.46)' },
  featureContent: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg, gap: spacing.sm },
  featureTag: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 5, overflow: 'hidden', backgroundColor: colors.accent, color: colors.onPrimary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  featureTitle: { maxWidth: 300, color: '#FFFFFF', fontSize: 20, fontWeight: '700', lineHeight: 26 },
  featureMeta: { color: 'rgba(255,255,255,0.84)', fontSize: 11, fontWeight: '500' },
  communityNote: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  communityGlyph: { color: colors.primaryDark, fontSize: 27 },
  communityCopy: { flex: 1, gap: 3 },
  communityTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  communityMessage: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  communityArrow: { color: colors.muted, fontSize: 28 },
  });
}