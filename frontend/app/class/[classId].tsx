import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, typography, layout, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ClassRecord, ClassMemberRecord } from '@/types/database';

export default function ClassDetailScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const [classData, setClassData] = useState<ClassRecord | null>(null);
  const [members, setMembers] = useState<ClassMemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClassDetails = useCallback(async () => {
    if (!classId || !supabase) {
      setError('Invalid class or Supabase not configured');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError('You must be signed in to view class details');
        setIsLoading(false);
        return;
      }

      const backendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:4000';
      
      // Fetch class details
      const classResponse = await fetch(`${backendUrl}/api/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (!classResponse.ok) {
        const errorData = await classResponse.json();
        throw new Error(errorData.message || 'Failed to load class details');
      }

      const classResult = await classResponse.json();
      setClassData(classResult.class);

      // Fetch class members
      const membersResponse = await fetch(`${backendUrl}/api/classes/${classId}/members`, {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (membersResponse.ok) {
        const membersResult = await membersResponse.json();
        setMembers(membersResult.members || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class details');
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadClassDetails();
  }, [loadClassDetails]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading class details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !classData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.content}>
          <EmptyState
            title="Unable to Load Class"
            message={error || 'Class details are unavailable'}
            variant="users"
            action={{
              label: 'Go Back',
              onPress: () => router.back(),
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </View>

        {/* Class Info Card */}
        <Card style={styles.classCard} variant="editorial">
          <View style={styles.classHeader}>
            <View style={styles.classAvatar}>
              <Text style={styles.classAvatarText}>
                {classData.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.classInfo}>
              <Text style={styles.className}>{classData.name}</Text>
              {classData.school_name && (
                <Text style={styles.classSchool}>{classData.school_name}</Text>
              )}
              <Text style={styles.classYear}>Class of {classData.academic_year}</Text>
            </View>
          </View>

          <View style={styles.classMeta}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Join Code</Text>
              <Text style={styles.metaValue}>{classData.join_code}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Status</Text>
              <View style={[styles.statusBadge, classData.status === 'active' && styles.statusBadgeActive]}>
                <Text style={[styles.statusText, classData.status === 'active' && styles.statusTextActive]}>
                  {classData.status === 'active' ? 'Active' : 'Archived'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Class Members ({members.length})</Text>
          {members.length === 0 ? (
            <EmptyState
              title="No members loaded"
              message="Member information is being synced"
              variant="users"
            />
          ) : (
            <View style={styles.membersList}>
              {members.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.user_id.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Member</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>
                  <Text style={styles.memberDate}>
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Back to Circle"
            variant="secondary"
            fullWidth
            onPress={() => router.push('/(tabs)/circle')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
    header: {
      marginBottom: spacing.lg,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    backButtonText: {
      ...typography.body,
      color: colors.accent,
      fontWeight: '600',
    },
    classCard: {
      marginBottom: spacing.xl,
    },
    classHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    classAvatar: {
      width: 64,
      height: 64,
      borderRadius: radius.xl,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    classAvatarText: {
      ...typography.serif.title,
      color: colors.accent,
      fontWeight: '700',
    },
    classInfo: {
      flex: 1,
    },
    className: {
      ...typography.serif.title2,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    classSchool: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    classYear: {
      ...typography.caption,
      color: colors.textMuted,
    },
    classMeta: {
      borderTopWidth: borders.hairline,
      borderTopColor: colors.borderSoft,
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metaLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    metaValue: {
      ...typography.mono.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: colors.backgroundSecondary,
    },
    statusBadgeActive: {
      backgroundColor: colors.successSoft,
    },
    statusText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    statusTextActive: {
      color: colors.success,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.serif.title3,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    membersList: {
      gap: spacing.sm,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: borders.hairline,
      borderColor: colors.borderSubtle,
      gap: spacing.md,
    },
    memberAvatar: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberAvatarText: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    memberRole: {
      ...typography.caption,
      color: colors.accent,
      textTransform: 'capitalize',
    },
    memberDate: {
      ...typography.caption2,
      color: colors.textMuted,
    },
    actions: {
      gap: spacing.md,
    },
  });
}