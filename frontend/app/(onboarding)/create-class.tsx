import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { Icon } from '@/components/ui/Icons';
export default function CreateClassScreen() {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleCreate = async () => {
    if (!supabase) {
      setErrorMessage('Configure Supabase in frontend/.env before creating a class.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Class name is required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        setErrorMessage('You must be signed in to create a class.');
        setIsSubmitting(false);
        return;
      }
      const backendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:4000',
      const response = await fetch(`${backendUrl}/api/classes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          schoolName: school.trim() || undefined,
          academicYear: Number(year),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? 'Could not create class.');
      }
      setJoinCode(result.class.join_code);
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create class.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCopyCode = () => {
    if (joinCode) {
      if (Platform.OS === 'web') {
        try {
          navigator.clipboard.writeText(joinCode);
          Alert.alert('Copied!', 'Join code copied to clipboard.');
        } catch {
          Alert.alert('Error', 'Could not copy to clipboard.');
        }
      } else {
        setStringAsync(joinCode).then(() => {
          Alert.alert('Copied!', 'Join code copied to clipboard.');
        });
      }
    }
  };
  const handleGoHome = () => {
    router.replace('/(tabs)/home');
  };
  if (showSuccess && joinCode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Icon name="star" size={48} color={themeColors.success} />
            </View>
            <Text style={styles.successTitle}>Class Created!</Text>
            <Text style={styles.successMessage}>
              Share this join code with your classmates so they can join.
            </Text>
            <View style={styles.joinCodeCard}>
              <Text style={styles.joinCodeLabel}>Join Code</Text>
              <Text style={styles.joinCodeValue}>{joinCode}</Text>
              <Pressable onPress={handleCopyCode} style={styles.copyButton}>
                <Icon name="share" size={18} color="#FFFFFF" />
                <Text style={styles.copyButtonText}>Copy Code</Text>
              </Pressable>
            </View>
            <Button
              title="Go to Home"
              variant="accent"
              onPress={handleGoHome}
              fullWidth
              style={styles.homeButton}
            />
            <Pressable onPress={() => router.push('/(onboarding)/join-class')} style={styles.joinLink}>
              <Text style={styles.joinLinkText}>Need to join a class instead?</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>Create Class</Text>
        <Text style={styles.title}>Build a private digital yearbook</Text>
        <Text style={styles.description}>
          Create a secure space for your class to share memories together.
        </Text>
        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Class Name *</Text>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrorMessage(null);
            }}
            style={styles.input}
            placeholder="e.g. 12-A, Computer Science 2024"
            placeholderTextColor={themeColors.textMuted}
            editable={!isSubmitting}
          />
          <Text style={styles.fieldLabel}>School / Institution</Text>
          <TextInput
            value={school}
            onChangeText={setSchool}
            style={styles.input}
            placeholder="e.g. Northfield Academy"
            placeholderTextColor={themeColors.textMuted}
            editable={!isSubmitting}
          />
          <Text style={styles.fieldLabel}>Academic Year</Text>
          <TextInput
            value={year}
            onChangeText={setYear}
            style={styles.input}
            placeholder={new Date().getFullYear().toString()}
            placeholderTextColor={themeColors.textMuted}
            keyboardType="number-pad"
            editable={!isSubmitting}
            maxLength={4}
          />
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          )}
          <Button
            title={isSubmitting ? 'Creating...' : 'Create Class'}
            onPress={handleCreate}
            variant="accent"
            fullWidth
            disabled={isSubmitting || !name.trim()}
          />
        </Card>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Want to join instead?</Text>
          <Pressable
            onPress={() => router.push('/(onboarding)/join-class')}
            disabled={isSubmitting}
          >
            <Text style={styles.footerLink}>Join a class</Text>
          </Pressable>
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
    },
    kicker: {
      ...typography.mono.micro,
      color: colors.accent,
      letterSpacing: 1.1,
      marginBottom: spacing.xs,
    },
    title: {
      ...typography.serif.title,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
      lineHeight: 22,
    },
    card: {
      borderRadius: radius.xl,
      marginBottom: spacing.xl,
    },
    fieldLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginBottom: spacing.lg,
      color: colors.textPrimary,
      ...typography.body,
    },
    errorContainer: {
      backgroundColor: colors.errorSoft,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    errorMessage: {
      ...typography.footnote,
      color: colors.error,
      textAlign: 'center',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    footerText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    footerLink: {
      ...typography.body,
      color: colors.accent,
      fontWeight: '600',
    },
    successContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
    },
    successIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.successSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
      borderWidth: 2,
      borderColor: colors.success,
    },
    successTitle: {
      ...typography.serif.title,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    successMessage: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xxxl,
      lineHeight: 22,
    },
    joinCodeCard: {
      width: '100%',
      padding: spacing.xl,
      borderRadius: radius.xl,
      backgroundColor: colors.surfaceOverlay,
      borderWidth: 2,
      borderColor: colors.borderEmphasized,
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    joinCodeLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    joinCodeValue: {
      ...typography.mono.title,
      fontSize: 32,
      fontWeight: '900',
      color: colors.textPrimary,
      marginBottom: spacing.lg,
      letterSpacing: 2,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: colors.accent,
      borderRadius: radius.round,
    },
    copyButtonText: {
      ...typography.bodyStrong,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    homeButton: {
      marginBottom: spacing.lg,
    },
    joinLink: {
      paddingVertical: spacing.sm,
    },
    joinLinkText: {
      ...typography.body,
      color: colors.accent,
      fontWeight: '600',
    },
  });
}