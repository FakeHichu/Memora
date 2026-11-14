import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, Alert, Platform, Clipboard, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase/client';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useAppTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/constants/theme';
import { Icon } from '@/components/ui/Icons';
import { IconButton } from '@/components/ui/IconButton';
import { getBackendUrl } from '@/lib/photo-upload';

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
  const [nameFocused, setNameFocused] = useState(false);
  const [schoolFocused, setSchoolFocused] = useState(false);
  const [yearFocused, setYearFocused] = useState(false);

  // Animated pulse for success icon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showSuccess) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [showSuccess, pulseAnim]);

  const isNameValid = name.trim().length >= 3;
  const isYearValid = /^\d{4}$/.test(year.trim());

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
      const backendUrl = getBackendUrl();
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
      if (result.class?.id) {
        await AsyncStorage.setItem('memora.active_class_id.v1', result.class.id);
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
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard
          .writeText(joinCode)
          .then(() => {
            Alert.alert('Copied!', 'Join code copied to clipboard.');
          })
          .catch(() => {
            Alert.alert('Error', 'Could not copy to clipboard.');
          });
      } else {
        Clipboard.setString(joinCode);
        Alert.alert('Copied!', 'Join code copied to clipboard.');
      }
    }
  };

  const handleShare = () => {
    Alert.alert(
      'Share with classmates',
      `Send this join code to your classmates:\n\n${joinCode}\n\nThey can enter it in the Memora app under Join Circle to access your shared memories.`,
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/circle');
  };

  if (showSuccess && joinCode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successContainer}>
            <Animated.View style={[styles.successIcon, { opacity: pulseAnim }]}>
              <Icon name="star" size={48} color={themeColors.success} />
            </Animated.View>
            <Text style={styles.successTitle}>Class Created!</Text>
            <Text style={styles.successMessage}>
              Share this join code with your classmates so they can join.
            </Text>
            <View style={[styles.joinCodeCard, {
              borderColor: themeColors.accent,
              shadowColor: themeColors.accent,
              shadowOpacity: 0.35,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }]}>
              <Text style={styles.joinCodeLabel}>Join Code</Text>
              <Text style={styles.joinCodeValue}>{joinCode}</Text>
              <Pressable onPress={handleCopyCode} style={styles.copyButton}>
                <Icon name="share" size={18} color="#FFFFFF" />
                <Text style={styles.copyButtonText}>Copy Code</Text>
              </Pressable>
              <Pressable onPress={handleShare} style={styles.shareButton}>
                <Icon name="users" size={18} color={themeColors.accent} />
                <Text style={styles.shareButtonText}>Share with classmates</Text>
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
      {/* Back button */}
      <View style={styles.backButtonWrap}>
        <IconButton icon="arrow-left" onPress={() => router.back()} variant="default" size="md" accessibilityLabel="Go back" />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerSection}>
          <Image source={require('@/assets/brand/logo-cat.png')} style={{ width: 56, height: 56 }} />
          <Text style={styles.kicker}>NEW CIRCLE</Text>
          <Text style={styles.title}>Create your class circle</Text>
          <Text style={styles.description}>
            Build a private space to share memories, photos, and moments with your class.
          </Text>
        </View>
        <Card style={styles.card} variant="editorial">
          {/* Class Name */}
          <Text style={styles.fieldLabel}>Class Name *</Text>
          <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrorMessage(null);
              }}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              style={styles.input}
              placeholder="e.g. 12-A, Computer Science 2024"
              placeholderTextColor={themeColors.textMuted}
              editable={!isSubmitting}
            />
            {isNameValid && (
              <View style={styles.validIcon}>
                <Icon name="star" size={16} color="#22c55e" />
              </View>
            )}
          </View>

          {/* School */}
          <Text style={styles.fieldLabel}>School / Institution</Text>
          <View style={[styles.inputWrap, schoolFocused && styles.inputWrapFocused]}>
            <TextInput
              value={school}
              onChangeText={setSchool}
              onFocus={() => setSchoolFocused(true)}
              onBlur={() => setSchoolFocused(false)}
              style={styles.input}
              placeholder="e.g. Northfield Academy"
              placeholderTextColor={themeColors.textMuted}
              editable={!isSubmitting}
            />
          </View>

          {/* Academic Year */}
          <Text style={styles.fieldLabel}>Academic Year</Text>
          <View style={[styles.inputWrap, yearFocused && styles.inputWrapFocused]}>
            <TextInput
              value={year}
              onChangeText={setYear}
              onFocus={() => setYearFocused(true)}
              onBlur={() => setYearFocused(false)}
              style={styles.input}
              placeholder={new Date().getFullYear().toString()}
              placeholderTextColor={themeColors.textMuted}
              keyboardType="number-pad"
              editable={!isSubmitting}
              maxLength={4}
            />
            {isYearValid && (
              <View style={styles.validIcon}>
                <Icon name="star" size={16} color="#22c55e" />
              </View>
            )}
          </View>

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
    backButtonWrap: {
      position: 'absolute',
      top: spacing.xl + 44, // below safe area
      left: spacing.lg,
      zIndex: 10,
    },
    content: {
      padding: spacing.xl,
      paddingTop: spacing.xxxl + spacing.xl,
    },
    headerSection: {
      alignItems: 'flex-start',
      marginBottom: spacing.xl,
      gap: spacing.xs,
    },
    kicker: {
      ...typography.mono.micro,
      color: colors.accent,
      letterSpacing: 1.5,
      marginTop: spacing.sm,
    },
    title: {
      ...typography.serif.title,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
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
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      borderRadius: radius.md,
      marginBottom: spacing.lg,
    },
    inputWrapFocused: {
      borderColor: colors.accent,
      borderWidth: 2,
    },
    input: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      color: colors.textPrimary,
      ...typography.body,
    },
    validIcon: {
      paddingRight: spacing.md,
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
      fontSize: 40,
      fontWeight: '900',
      color: colors.textPrimary,
      marginBottom: spacing.lg,
      letterSpacing: 4,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: colors.accent,
      borderRadius: radius.round,
      marginBottom: spacing.sm,
    },
    copyButtonText: {
      ...typography.bodyStrong,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: colors.accentSubtle,
      borderRadius: radius.round,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    shareButtonText: {
      ...typography.bodyStrong,
      color: colors.accent,
      fontWeight: '600',
    },
    homeButton: {
      marginBottom: spacing.lg,
      marginTop: spacing.sm,
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
