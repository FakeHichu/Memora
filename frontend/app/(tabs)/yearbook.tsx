import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { getLocalPhotoPosts, type LocalPhotoPost } from '@/lib/photo-draft';
import { useAppTheme } from '@/providers/ThemeProvider';

type Edition = 'Mine' | 'Class';

export default function YearbookScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [posts, setPosts] = useState<LocalPhotoPost[]>([]);
  const [edition, setEdition] = useState<Edition>('Mine');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getLocalPhotoPosts()
        .then((savedPosts) => {
          if (isActive) {
            setPosts(savedPosts);
            const newestYear = savedPosts[0] ? new Date(savedPosts[0].createdAt).getFullYear() : new Date().getFullYear();
            setSelectedYear(newestYear);
          }
        })
        .catch(() => {
          if (isActive) setPosts([]);
        });
      return () => {
        isActive = false;
      };
    }, []),
  );

  const years = Array.from(new Set([new Date().getFullYear(), ...posts.map((post) => new Date(post.createdAt).getFullYear())])).sort((left, right) => right - left);
  const yearPosts = posts.filter((post) => new Date(post.createdAt).getFullYear() === selectedYear);
  const monthKeys = Array.from(new Set(yearPosts.map((post) => new Date(post.createdAt).getMonth()))).sort((left, right) => right - left);
  const coverPhoto = yearPosts[0]?.uri;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>MEMORA</Text>
            <Text style={styles.headerTitle}>Yearbook</Text>
          </View>
          <Text style={styles.headerGlyph}>✳</Text>
        </View>

        <View style={styles.editionTabs}>
          {(['Mine', 'Class'] as const).map((item) => (
            <Pressable key={item} onPress={() => setEdition(item)} style={[styles.editionTab, edition === item && styles.editionTabActive]} accessibilityRole="button" accessibilityState={{ selected: edition === item }} accessibilityLabel={`${item} yearbook`}>
              <Text style={[styles.editionText, edition === item && styles.editionTextActive]}>{item === 'Mine' ? 'My Yearbook' : 'Class Yearbook'}</Text>
            </Pressable>
          ))}
        </View>

        {edition === 'Mine' ? (
          <>
            <View style={styles.cover}>
              {coverPhoto ? <Image source={{ uri: coverPhoto }} style={styles.coverImage} resizeMode="cover" accessibilityLabel={`Cover image for ${selectedYear}`} /> : null}
              <View style={[styles.coverTint, !coverPhoto && styles.coverTintEmpty]} />
              <View style={styles.coverTop}>
                <Text style={styles.coverBrand}>A YEAR IN MEMORA</Text>
                <Text style={styles.coverSeal}>M</Text>
              </View>
              <View style={styles.coverBottom}>
                <Text style={styles.coverEyebrow}>YOUR LIVING YEARBOOK</Text>
                <Text style={styles.coverYear}>{selectedYear}</Text>
                <Text style={styles.coverCaption}>{yearPosts.length ? 'The moments you chose to keep.' : 'Waiting for your first moment.'}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <YearbookStat value={`${yearPosts.length}`} label="MEMORIES" />
              <View style={styles.statDivider} />
              <YearbookStat value={`${monthKeys.length}`} label="ACTIVE MONTHS" />
              <View style={styles.statDivider} />
              <YearbookStat value="PRIVATE" label="SAVED ON DEVICE" />
            </View>

            {years.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearRail}>
                {years.map((year) => (
                  <Pressable key={year} onPress={() => setSelectedYear(year)} style={[styles.yearChip, selectedYear === year && styles.yearChipActive]} accessibilityRole="button" accessibilityLabel={`Show year ${year}`} accessibilityState={{ selected: selectedYear === year }}>
                    <Text style={[styles.yearChipText, selectedYear === year && styles.yearChipTextActive]}>{year}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {monthKeys.length ? monthKeys.map((month) => {
              const monthPosts = yearPosts.filter((post) => new Date(post.createdAt).getMonth() === month);
              const monthTitle = new Date(selectedYear, month).toLocaleDateString(undefined, { month: 'long' });
              return (
                <View key={`${selectedYear}-${month}`} style={styles.monthSection}>
                  <View style={styles.monthHeader}>
                    <View>
                      <Text style={styles.monthTitle}>{monthTitle}</Text>
                      <Text style={styles.monthMeta}>{monthPosts.length} {monthPosts.length === 1 ? 'moment' : 'moments'}</Text>
                    </View>
                    <Text style={styles.monthNumber}>{String(month + 1).padStart(2, '0')}</Text>
                  </View>
                  <View style={styles.photoGrid}>
                    {monthPosts.map((post) => (
                      <Pressable key={post.id} style={styles.photoTile} onPress={() => router.push(`/post/${post.id}`)} accessibilityRole="button" accessibilityLabel={`Open yearbook memory: ${post.caption || 'A moment from today'}`}>
                        <Image source={{ uri: post.uri }} style={styles.photo} resizeMode="cover" accessibilityLabel={post.caption || 'Saved memory'} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            }) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyMark}>✳</Text>
                <Text style={styles.emptyTitle}>Every year starts somewhere.</Text>
                <Text style={styles.emptyText}>Your private photos will become the chapters of this book.</Text>
                <Pressable style={styles.captureButton} onPress={() => router.push('/camera')} accessibilityRole="button" accessibilityLabel="Capture the first yearbook memory">
                  <Text style={styles.captureButtonText}>Add your first memory  ↗</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <View style={styles.classUnavailable}>
            <View style={styles.classMark}><Text style={styles.classMarkText}>M</Text></View>
            <Text style={styles.classEyebrow}>SHARED, BY PERMISSION</Text>
            <Text style={styles.classTitle}>A yearbook made together.</Text>
            <Text style={styles.classText}>Class chapters appear after a verified class membership and its private memory service are connected. Nothing here is public.</Text>
            <Pressable style={styles.classButton} onPress={() => router.push('/(tabs)/class')} accessibilityRole="button" accessibilityLabel="Open private class settings">
              <Text style={styles.classButtonText}>Open class space  ↗</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerGlyph}>⌑</Text>
          <Text style={styles.footerText}>Your yearbook grows from memories you choose to keep.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function YearbookStat({ value, label }: { value: string; label: string }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', letterSpacing: 1.8 },
  headerTitle: { ...typography.heading, color: colors.text, marginTop: 2 },
  headerGlyph: { color: colors.primary, fontSize: 28 },
  editionTabs: { flexDirection: 'row', padding: 3, borderRadius: radius.md, backgroundColor: colors.surface },
  editionTab: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  editionTabActive: { backgroundColor: colors.card },
  editionText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  editionTextActive: { color: colors.text, fontWeight: '700' },
  cover: { height: 242, overflow: 'hidden', justifyContent: 'space-between', padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.secondary },
  coverImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  coverTint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,9,15,0.5)' },
  coverTintEmpty: { backgroundColor: '#4F5D75' },
  coverTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coverBrand: { color: 'rgba(255,255,255,0.86)', fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  coverSeal: { width: 34, height: 34, textAlign: 'center', textAlignVertical: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 17, color: '#FFFFFF', fontFamily: 'Georgia', fontSize: 17, fontWeight: '700' },
  coverBottom: { gap: 2 },
  coverEyebrow: { color: 'rgba(255,255,255,0.82)', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  coverYear: { color: '#FFFFFF', fontFamily: 'Georgia', fontSize: 54, fontWeight: '700', lineHeight: 60 },
  coverCaption: { color: 'rgba(255,255,255,0.9)', fontSize: 11 },
  statsRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  statLabel: { color: colors.muted, fontSize: 7, fontWeight: '700', letterSpacing: 0.6, textAlign: 'center' },
  statDivider: { width: 1, height: 25, backgroundColor: colors.border },
  yearRail: { gap: spacing.sm },
  yearChip: { minHeight: 34, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: 17, backgroundColor: colors.surface },
  yearChipActive: { backgroundColor: colors.primary },
  yearChipText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  yearChipTextActive: { color: colors.onPrimary },
  monthSection: { gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderColor: colors.border },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { color: colors.text, fontFamily: 'Georgia', fontSize: 21, fontWeight: '700' },
  monthMeta: { color: colors.muted, fontSize: 10, marginTop: 2 },
  monthNumber: { color: colors.primary, fontFamily: 'Georgia', fontSize: 25 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoTile: { width: '31.7%', aspectRatio: 0.9, backgroundColor: colors.surface, borderRadius: radius.sm, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  emptyState: { minHeight: 210, justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  emptyMark: { color: colors.primary, fontSize: 31 },
  emptyTitle: { ...typography.subheading, color: colors.text },
  emptyText: { maxWidth: 320, color: colors.muted, fontSize: 12, lineHeight: 18 },
  captureButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', paddingRight: spacing.md },
  captureButtonText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  classUnavailable: { minHeight: 330, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  classMark: { width: 58, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: colors.primary },
  classMarkText: { color: colors.onPrimary, fontFamily: 'Georgia', fontSize: 30, fontWeight: '700' },
  classEyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  classTitle: { color: colors.text, fontFamily: 'Georgia', fontSize: 23, fontWeight: '700', textAlign: 'center' },
  classText: { maxWidth: 340, color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  classButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  classButtonText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  footerNote: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderColor: colors.border },
  footerGlyph: { color: colors.primaryDark, fontSize: 20 },
  footerText: { flex: 1, color: colors.muted, fontSize: 10 },
  });
}
