import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { useClass } from '@/hooks/useClass';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Icon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';

export default function ClassScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const styles = createStyles(colors);
  const { classes, activeClass, isLoading, error, refreshClasses, selectClass } = useClass();

  useEffect(() => {
    refreshClasses();
  }, [refreshClasses]);

  const handleCreateClass = async () => {
    // Navigate to create class screen
    router.push('/(onboarding)/create-class');
  };

  const handleJoinClass = async () => {
    // Navigate to join class screen
    router.push('/(onboarding)/join-class');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.skeletonContainer}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonRow} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.errorText}>{error}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (classes.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.content}>
          <BackgroundPattern opacity={0.022} />
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No classes yet</Text>
            <Text style={styles.emptyStateMessage}>
              Create your first class or join one using a join code
            </Text>
            <View style={styles.emptyStateActions}>
              <Button
                title="Create a class"
                onPress={handleCreateClass}
                variant="accent"
                fullWidth
              />
              <Button title="Join a class" onPress={handleJoinClass} variant="secondary" fullWidth />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Classes</Text>

        {/* Create Class Button */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleCreateClass}
            style={styles.createButton}
            accessibilityRole="button"
            accessibilityLabel="Create a new class"
          >
            <View style={styles.createIcon}>
              <Icon name="plus" size={20} color={colors.accent} />
            </View>
            <View style={styles.createLabel}>
              <Text style={styles.createText}>Create Class</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleJoinClass}
            style={styles.joinButton}
            accessibilityRole="button"
            accessibilityLabel="Join a class"
          >
            <View style={styles.joinIcon}>
              <Icon name="users" size={20} color={colors.accent} />
            </View>
            <View style={styles.joinLabel}>
              <Text style={styles.joinText}>Join Class</Text>
            </View>
          </Pressable>
        </View>

        {/* Classes List */}
        <View style={styles.classesList}>
          {classes.map((classRecord) => (
            <View key={classRecord.id} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classRecord.name}</Text>
                <Text style={styles.classMeta}>
                  {classRecord.school_name || ''} • {classRecord.academic_year}
                </Text>
              </View>
              <Text style={styles.classJoinCode}>{classRecord.join_code}</Text>
              <Pressable
                onPress={() => selectClass(classRecord.id)}
                style={styles.classAction}
                accessibilityRole="button"
                accessibilityLabel={`View class ${classRecord.name}`}
              >
                <Text style={styles.classActionText}>View</Text>
              </Pressable>
            </View>
          ))}
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
      gap: spacing.lg,
    },
    title: {
      ...typography.title,
      color: colors.text,
    },
    errorText: {
      ...typography.body,
      color: colors.error,
      marginBottom: spacing.lg,
    },
    actionRow: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'center',
    },
    createButton: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      padding: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    joinButton: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: radius.xl,
      padding: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    createIcon: {
      width: 28,
      height: 28,
      marginBottom: spacing.xs,
    },
    createLabel: {
    },
    createText: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    joinIcon: {
      width: 28,
      height: 28,
      marginBottom: spacing.xs,
    },
    joinLabel: {
    },
    joinText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    classesList: {
      marginTop: spacing.xl,
    },
    classCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    classHeader: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderColor: colors.borderSoft,
    },
    className: {
      ...typography.serif.title,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    classMeta: {
      ...typography.sans.caption,
      color: colors.textMuted,
    },
    classJoinCode: {
      color: colors.accent,
      fontFamily: 'Georgia',
      fontSize: 18,
      fontWeight: '700',
    },
    classAction: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderColor: colors.borderSoft,
    },
    classActionText: {
      color: colors.accent,
      fontWeight: '600',
    },
    skeletonContainer: {
      height: 120,
    },
    skeletonRow: {
      width: 80,
      height: 36,
      borderRadius: 20,
      backgroundColor: colors.backgroundElevated,
      marginRight: spacing.xs,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyStateTitle: {
      ...typography.serif.title,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    emptyStateMessage: {
      ...typography.sans.body,
      color: colors.textMuted,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    emptyStateActions: {
      flexDirection: 'column',
      gap: spacing.md,
      alignItems: 'center',
    },
  });
}