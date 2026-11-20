import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Icon } from '@/components/ui/Icons';
import type { ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { HeartMark } from '@/components/ui/HeartMark';
import { supabase } from '@/lib/supabase/client';

export default function RegisterScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const validateFullName = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setFullNameError('Full name is required');
      return false;
    }
    if (trimmed.length < 2) {
      setFullNameError('Name must be at least 2 characters');
      return false;
    }
    setFullNameError(null);
    return true;
  };

  const validateUsername = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setUsernameError('Username is required');
      return false;
    }
    if (trimmed.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    if (trimmed.length > 20) {
      setUsernameError('Username must be 20 characters or less');
      return false;
    }
    // Allow letters, numbers, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUsernameError('Username can only contain letters, numbers, _ and -');
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError('Email is required');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (val.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (val: string): boolean => {
    if (!val) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (val !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handleRegister = async () => {
    // Validate all fields
    const isFullNameValid = validateFullName(fullName);
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isFullNameValid || !isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!supabase) {
        Alert.alert(
          'Service Unavailable',
          'Authentication service is not configured. Please check your setup.',
          [{ text: 'OK' }]
        );
        return;
      }

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim(),
          },
        },
      });

      if (authError) {
        console.error('Signup error:', authError);
        
        // Handle specific error cases
        if (authError.message.includes('already registered')) {
          Alert.alert(
            'Email Already Registered',
            'This email is already registered. Please sign in or use a different email.',
            [{ text: 'OK' }]
          );
        } else if (authError.message.includes('Password')) {
          Alert.alert(
            'Password Error',
            authError.message,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Registration Failed',
            authError.message || 'Unable to create account. Please try again.',
            [{ text: 'OK' }]
          );
        }
        return;
      }

      if (!authData.user) {
        Alert.alert(
          'Registration Failed',
          'Unable to create account. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      // 2. Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username.trim().toLowerCase(),
          display_name: fullName.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't show error to user - auth was successful
        // Profile will be created on next login if needed
      }

      // 3. Check if email confirmation is required
      if (authData.session) {
        // Auto-signed in (email confirmation not required)
        Alert.alert(
          'Welcome to Memora! 🎉',
          `Hi ${fullName}! Your account has been created successfully.`,
          [
            {
              text: 'Get Started',
              onPress: () => router.replace('/(tabs)/home'),
            },
          ]
        );
      } else {
        // Email confirmation required
        Alert.alert(
          'Check Your Email 📧',
          `We've sent a confirmation email to ${email}. Please click the link in the email to verify your account, then sign in.`,
          [
            {
              text: 'Go to Sign In',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Brand Row */}
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <HeartMark size={46} />
            </View>
            <View>
              <Text style={styles.brandName}>Memora</Text>
              <Text style={styles.brandTagline}>Your class. Your people. Your memories.</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join your class circle today!</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <View style={[styles.inputTrack, fullNameError && styles.inputError]}>
                <Icon name="user" size={18} color={colors.textSecondary} />
                <TextInput
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (fullNameError) setFullNameError(null);
                  }}
                  onBlur={() => fullName && validateFullName(fullName)}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textMuted}
                  autoComplete="name"
                  autoCapitalize="words"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  style={styles.input}
                />
              </View>
              {fullNameError ? <Text style={styles.fieldError}>{fullNameError}</Text> : null}
            </View>

            {/* Username */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Username</Text>
              <View style={[styles.inputTrack, usernameError && styles.inputError]}>
                <Icon name="user" size={18} color={colors.textSecondary} />
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (usernameError) setUsernameError(null);
                  }}
                  onBlur={() => username && validateUsername(username)}
                  placeholder="johndoe"
                  placeholderTextColor={colors.textMuted}
                  autoComplete="username"
                  autoCapitalize="none"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  style={styles.input}
                />
              </View>
              {usernameError ? <Text style={styles.fieldError}>{usernameError}</Text> : null}
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email address</Text>
              <View style={[styles.inputTrack, emailError && styles.inputError]}>
                <Icon name="envelope" size={18} color={colors.textSecondary} />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={() => email && validateEmail(email)}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  style={styles.input}
                />
              </View>
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[styles.inputTrack, passwordError && styles.inputError]}>
                <Icon name="padlock" size={18} color={colors.textSecondary} />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError(null);
                    if (confirmPassword && confirmPasswordError) {
                      validateConfirmPassword(confirmPassword);
                    }
                  }}
                  onBlur={() => password && validatePassword(password)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordButton}
                  disabled={isSubmitting}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
              {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Confirm password</Text>
              <View style={[styles.inputTrack, confirmPasswordError && styles.inputError]}>
                <Icon name="padlock" size={18} color={colors.textSecondary} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError(null);
                  }}
                  onBlur={() => confirmPassword && validateConfirmPassword(confirmPassword)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  editable={!isSubmitting}
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.showPasswordButton}
                  disabled={isSubmitting}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.showPasswordText}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.fieldError}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleRegister}
              disabled={
                isSubmitting || !fullName || !username || !email || !password || !confirmPassword
              }
              style={({ pressed }) => [
                styles.primaryButton,
                (isSubmitting || !fullName || !username || !email || !password || !confirmPassword) &&
                  styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable disabled={isSubmitting}>
                <Text style={[styles.loginLink, isSubmitting && styles.linkDisabled]}>
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    content: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
      gap: 18,
    },
    brandRow: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'center',
      marginBottom: 2,
    },
    brandMark: {
      width: 64,
      height: 64,
      borderRadius: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      overflow: 'visible',
      borderWidth: 0,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: `0 8px 24px ${isDark ? 'rgba(128, 82, 200, 0.4)' : 'rgba(128, 101, 143, 0.3)'}`,
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }),
    },
    brandMarkImage: {
      width: 52,
      height: 52,
      borderRadius: 18,
    },
    brandName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.4,
    },
    brandTagline: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
      letterSpacing: 0,
    },
    headerBlock: {
      alignItems: 'center',
      gap: 6,
    },
    title: {
      fontSize: 21,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      gap: 16,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 12px 36px rgba(0, 0, 0, 0.5)'
              : '0 12px 36px rgba(48, 36, 61, 0.08)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 16,
            elevation: 4,
          }),
    },
    fieldContainer: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      letterSpacing: 0.2,
      marginLeft: 4,
    },
    inputTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceOverlay,
      borderRadius: 999,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      minHeight: 50,
      gap: 10,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
      paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    },
    inputError: {
      borderColor: colors.error,
    },
    showPasswordButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    showPasswordText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
    },
    fieldError: {
      fontSize: 12,
      color: colors.error,
      marginLeft: 12,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 999,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: `0 6px 20px ${isDark ? 'rgba(128, 82, 200, 0.4)' : 'rgba(128, 101, 143, 0.3)'}`,
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }),
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    linkDisabled: {
      opacity: 0.5,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    loginLink: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
  });
}
