import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
export default function JoinClassScreen() {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [className, setClassName] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState<number | null>(null);
  const [memberRole, setMemberRole] = useState<string>('member');
  const handleJoin = async () => {
    if (!supabase) {
      setErrorMessage('Configure Supabase in frontend/.env before joining a class.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Please enter a join code.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        setErrorMessage('You must be signed in to join a class.');
        setIsSubmitting(false);
        return;
      }
      const cleanCode = code.trim().toUpperCase();
      const backendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/classes/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joinCode: cleanCode }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? 'Could not join class.');
      }
      setClassName(result.class.name);
      setSchoolName(result.class.school_name);
      setAcademicYear(result.class.academic_year);
      setMemberRole(result.member?.role || 'member');
      if (result.alreadyJoined) {
        setSuccessMessage('You are already a member of this class.');
      } else {
        setSuccessMessage('Successfully joined the class!');
      }
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not join class.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>Join Class</Text>
        <Text style={styles.title}>Enter your class code</Text>
        <Text style={styles.description}>
          Ask your class owner for the 8-character invitation code.
        </Text>
        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Class Join Code</Text>
          <TextInput
            value={code}
            onChangeText={(text) => {
              setCode(text);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            autoCapitalize="characters"
            style={styles.input}
            placeholder="ABCD1234"
            placeholderTextColor={themeColors.textMuted}
            returnKeyType="done"
            onSubmitEditing={handleJoin}
            editable={!isSubmitting}
            maxLength={8}
          />
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          )}
          {successMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successMessage}>{successMessage}</Text>
            </View>
          )}
          <Button
            title={isSubmitting ? 'Joining...' : 'Join Class'}
            onPress={handleJoin}
            variant="accent"
            fullWidth
            disabled={isSubmitting || !code.trim()}
          />
        </Card>
        {className && (
          <View style={styles.classDetails}>
            <Text style={styles.classDetailLabel}>Class Information</Text>
            <Text style={styles.classDetailValue}>{className}</Text>
            {schoolName && <Text style={styles.classDetailInfo}>{schoolName}</Text>}
            {academicYear && (
              <Text style={styles.classDetailInfo}>Academic Year {academicYear}</Text>
            )}
            <Text style={styles.classDetailRole}>Your role: {memberRole}</Text>
          </View>
        )}
        <View style={styles.helperWrap}>
          <Text style={styles.helperTitle}>Private by design</Text>
          <Text style={styles.helperText}>
            Only members with a valid join code can access class memories and photos.
          </Text>
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
      ...typography.mono.title,
      fontSize: 18,
      textAlign: 'center',
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
    successContainer: {
      backgroundColor: colors.successSoft,
      borderWidth: 1,
      borderColor: colors.success,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    successMessage: {
      ...typography.footnote,
      color: colors.success,
      textAlign: 'center',
      fontWeight: '600',
    },
    classDetails: {
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: colors.surfaceOverlay,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      marginBottom: spacing.xl,
    },
    classDetailLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    classDetailValue: {
      ...typography.serif.title2,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    classDetailInfo: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    classDetailRole: {
      ...typography.footnote,
      color: colors.accent,
      marginTop: spacing.sm,
      fontWeight: '600',
    },
    helperWrap: {
      borderRadius: radius.lg,
      backgroundColor: colors.accentSubtle,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      padding: spacing.lg,
    },
    helperTitle: {
      ...typography.serif.title3,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    helperText: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 22,
    },
  });
}