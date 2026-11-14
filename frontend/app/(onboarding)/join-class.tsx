import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useClass } from '@/hooks/useClass';
import { getBackendUrl } from '@/lib/photo-upload';

export default function JoinClassScreen() {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const { refreshClasses } = useClass();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [className, setClassName] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState<number | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
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
    setJoinSuccess(false);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        setErrorMessage('You must be signed in to join a class.');
        setIsSubmitting(false);
        return;
      }
      const cleanCode = code.trim().toUpperCase();
      const backendUrl = getBackendUrl();
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
      // Successfully joined - save class info
      setClassName(result.class.name);
      setSchoolName(result.class.school_name);
      setAcademicYear(result.class.academic_year);
      setAlreadyJoined(result.alreadyJoined);
      setJoinSuccess(true);
      
      // Select the joined circle as the active circle
      if (result.class?.id) {
        await AsyncStorage.setItem('memora.active_class_id.v1', result.class.id);
      }

      // Refresh the classes list to show the new class
      await refreshClasses();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not join class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    // Navigate to Circle page where the new class will be visible
    router.replace('/(tabs)/circle');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!joinSuccess ? (
          <>
            <Text style={styles.kicker}>Join Class</Text>
            <Text style={styles.title}>Enter your class code</Text>
            <Text style={styles.description}>
              Ask your class owner for the 8-character invitation code.
            </Text>
            <Card style={styles.card} variant="editorial">
              <Text style={styles.fieldLabel}>Class Join Code (8 characters)</Text>
              <TextInput
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  setErrorMessage(null);
                }}
                autoCapitalize="characters"
                style={styles.input}
                placeholder="ABC12345"
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
              <Button
                title={isSubmitting ? 'Joining...' : 'Join Class'}
                onPress={handleJoin}
                variant="accent"
                fullWidth
                disabled={isSubmitting || !code.trim()}
              />
            </Card>
            <View style={styles.helperWrap}>
              <Text style={styles.helperTitle}>Private by design</Text>
              <Text style={styles.helperText}>
                Only members with a valid join code can access class memories and photos.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Success Confirmation */}
            <View style={styles.successScreen}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.successTitle}>You're inside this class!</Text>
              <Text style={styles.successSubtitle}>Welcome to your class community.</Text>
              
              {className && (
                <Card style={styles.classInfoCard} variant="editorial">
                  <Text style={styles.classInfoLabel}>Class Information</Text>
                  <Text style={styles.classInfoName}>{className}</Text>
                  {schoolName && <Text style={styles.classInfoDetail}>{schoolName}</Text>}
                  {academicYear && (
                    <Text style={styles.classInfoDetail}>Class of {academicYear}</Text>
                  )}
                  {alreadyJoined && (
                    <View style={styles.alreadyMemberBadge}>
                      <Text style={styles.alreadyMemberText}>Already a member</Text>
                    </View>
                  )}
                </Card>
              )}

              <Button
                title="Continue to Circle"
                onPress={handleContinue}
                variant="accent"
                fullWidth
                style={styles.continueButton}
              />
              
              <View style={styles.successHelper}>
                <Text style={styles.successHelperText}>
                  Your new class will appear on the Circle page where you can see all your class
                  memories and connect with classmates.
                </Text>
              </View>
            </View>
          </>
        )}
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
    // Success screen styles
    successScreen: {
      paddingTop: spacing.xxl,
      alignItems: 'center',
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: radius.round,
      backgroundColor: colors.successSoft,
      borderWidth: 3,
      borderColor: colors.success,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    successIconText: {
      fontSize: 40,
      color: colors.success,
      fontWeight: '700',
    },
    successTitle: {
      ...typography.serif.title,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    successSubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 22,
    },
    classInfoCard: {
      width: '100%',
      marginBottom: spacing.xl,
    },
    classInfoLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    classInfoName: {
      ...typography.serif.title2,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    classInfoDetail: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    alreadyMemberBadge: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.accentSubtle,
      borderRadius: radius.md,
      alignSelf: 'flex-start',
    },
    alreadyMemberText: {
      ...typography.caption,
      color: colors.accent,
      fontWeight: '600',
    },
    continueButton: {
      width: '100%',
      marginBottom: spacing.lg,
    },
    successHelper: {
      backgroundColor: colors.backgroundElevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    successHelperText: {
      ...typography.footnote,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}