import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { previewPosts, previewStories, previewTopics } from '@/lib/social-preview';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function DiscoverScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTopics = previewTopics.filter((topic) => `${topic.title} ${topic.count}`.toLowerCase().includes(normalizedQuery));
  const filteredPeople = previewStories.filter((story) => story.name.toLowerCase().includes(normalizedQuery));
  const filteredPosts = previewPosts.filter((post) => `${post.name} ${post.caption} ${post.location}`.toLowerCase().includes(normalizedQuery));

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

        <View style={styles.previewNotice}>
          <View style={styles.previewDot} />
          <Text style={styles.previewNoticeText}>PREVIEW CONTENT · NOT CONNECTED TO A LIVE FEED</Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>A PLACE TO START</Text>
            <Text style={styles.sectionTitle}>Trending memories</Text>
          </View>
          <Text style={styles.sectionArrow}>↗</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicRail}>
          {filteredTopics.length ? filteredTopics.map((topic, index) => (
            <Pressable key={topic.id} onPress={() => setQuery(topic.title)} style={[styles.topicCard, { backgroundColor: mode === 'dark' ? topic.tint : colors.surface }]} accessibilityRole="button" accessibilityLabel={`${topic.title}, ${topic.count}, preview`}>
              <Text style={styles.topicIndex}>0{index + 1} / PREVIEW</Text>
              <View style={styles.topicShape}><Text style={styles.topicShapeText}>{index === 0 ? '✳' : index === 1 ? '◌' : '⌁'}</Text></View>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicCount}>{topic.count}</Text>
            </Pressable>
          )) : <Text style={styles.noResults}>No preview topics match that search.</Text>}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>PEOPLE TO REMEMBER</Text>
            <Text style={styles.sectionTitle}>People you may know</Text>
          </View>
          <Text style={styles.sampleTag}>SAMPLE</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRail}>
          {filteredPeople.map((person) => (
            <View key={person.id} style={styles.personItem}>
              <Avatar name={person.name} size={62} photoUri={person.photoUri} ring />
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.personMeta}>Preview profile</Text>
            </View>
          ))}
          {!filteredPeople.length ? <Text style={styles.noResults}>No preview people match that search.</Text> : null}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>A MOMENT FROM THE COMMUNITY</Text>
            <Text style={styles.sectionTitle}>Recent moments</Text>
          </View>
        </View>
        {filteredPosts.map((post) => (
          <View key={post.id} style={styles.feature}>
            <Image source={{ uri: post.photoUri }} style={styles.featureImage} resizeMode="cover" accessibilityLabel={post.caption} />
            <View style={styles.featureShade} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTag}>SAMPLE MOMENT</Text>
              <Text style={styles.featureTitle}>{post.caption}</Text>
              <Text style={styles.featureMeta}>{post.location}  ·  {post.likes} appreciations</Text>
            </View>
          </View>
        ))}
        {!filteredPosts.length ? <Text style={styles.noResults}>No preview moments match that search.</Text> : null}

        <View style={styles.communityNote}>
          <Text style={styles.communityGlyph}>⌂</Text>
          <View style={styles.communityCopy}>
            <Text style={styles.communityTitle}>Your private class community</Text>
            <Text style={styles.communityMessage}>Class discovery will use verified memberships when connected.</Text>
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
  personItem: { width: 76, alignItems: 'center', gap: spacing.xs },
  personName: { color: colors.text, fontSize: 12, fontWeight: '600' },
  personMeta: { color: colors.muted, fontSize: 9 },
  sampleTag: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  noResults: { paddingVertical: spacing.lg, color: colors.muted, fontSize: 13 },
  feature: { height: 270, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: '#343A36' },
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
