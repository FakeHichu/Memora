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
import { useAuth } from '@/hooks/useAuth';
import { hasSupabaseConfig, supabase } from '@/lib/supabase/client';
import { useAppTheme } from '@/providers/ThemeProvider';
import { HeartMark } from '@/components/ui/HeartMark';
import { SocialAuthButtons } from '@/components/ui/SocialAuthButtons';
export default function LoginScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
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
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };
  const handleLogin = async () => {
    setErrorMessage(null);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;
    setIsSubmitting(true);
    try {
      console.log('Attempting login with email:', email.trim());
      const { data, error } = await signInWithEmail(email.trim(), password);
      console.log('Login response:', { hasData: !!data, hasError: !!error, error: error?.message });
      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Please verify your email before signing in.');
        } else if (error.message.includes('fetch')) {
          setErrorMessage('Network error. Please check your internet connection and try again.');
        } else {
          setErrorMessage(error.message);
        }
        setIsSubmitting(false);
        return;
      }
      if (data?.session && data?.user) {
        // Ensure profile exists (create if missing)
        if (supabase) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', data.user.id)
              .maybeSingle();
            
            if (!profile) {
              // Profile doesn't exist, create it
              const username = data.user.email?.split('@')[0] || 'user';
              const displayName = data.user.user_metadata?.full_name || 
                                data.user.user_metadata?.display_name || 
                                username;
              
              await supabase.from('profiles').insert({
                id: data.user.id,
                username: username.toLowerCase(),
                display_name: displayName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              
              console.log('Profile created for existing user');
            }
          } catch (profileError) {
            console.warn('Profile check/creation failed:', profileError);
            // Continue anyway - profile will be created later if needed
          }
        }
        
        console.log('Login successful, navigating to home');
        router.replace('/(tabs)/home');
      } else {
        setErrorMessage('Unable to sign in. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Login exception:', err);
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      if (errorMsg.includes('fetch') || errorMsg.includes('network')) {
        setErrorMessage('Network error. Please check your internet connection and try again.');
      } else {
        setErrorMessage(errorMsg);
      }
      setIsSubmitting(false);
    }
  };
  const continueLocally = () => router.replace('/(tabs)/home');

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      const { data, error } = await signInWithGoogle();

      if (error) {
        if (error.message.includes('cancel')) {
          console.log('Google sign-in cancelled');
          // Don't show error for cancellation
        } else {
          console.error('Google sign-in error:', error);
          setErrorMessage(error.message || 'Google sign-in failed. Please try again.');
        }
        setIsGoogleLoading(false);
        return;
      }

      if (data?.session && data?.user) {
        // Ensure profile exists
        if (supabase) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', data.user.id)
              .maybeSingle();

            if (!profile) {
              // Create profile for OAuth user
              const username = data.user.email?.split('@')[0] || 'user';
              const displayName =
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                data.user.user_metadata?.display_name ||
                username;

              await supabase.from('profiles').insert({
                id: data.user.id,
                username: username.toLowerCase(),
                display_name: displayName,
                avatar_url: data.user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

              console.log('Profile created for OAuth user');
            }
          } catch (profileError) {
            console.warn('Profile check/creation failed:', profileError);
          }
        }

        console.log('Google sign-in successful');
        router.replace('/(tabs)/home');
      } else {
        setErrorMessage('Unable to complete Google sign-in. Please try again.');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error('Google sign-in exception:', err);
      setErrorMessage('An unexpected error occurred during Google sign-in.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Centered Brand Header matching reference board */}
          <View style={styles.brandRow}>
            <HeartMark size={54} />
            <Text style={styles.brandName}>Memora</Text>
            <Text style={styles.brandTagline}>Welcome back</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {hasSupabaseConfig ? (
              <>
                {/* Email field */}
                <View style={styles.fieldContainer}>
                  <View style={[styles.inputTrack, emailError && styles.inputError]}>
                    <Icon name="envelope" size={18} color={colors.textSecondary} />
                    <TextInput
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError(null);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onBlur={() => email && validateEmail(email)}
                      placeholder="Email address"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      returnKeyType="next"
                      editable={!isSubmitting}
                      style={styles.input}
                      accessibilityLabel="Email address"
                    />
                  </View>
                  {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
                </View>

                {/* Password field */}
                <View style={styles.fieldContainer}>
                  <View style={[styles.inputTrack, passwordError && styles.inputError]}>
                    <Icon name="padlock" size={18} color={colors.textSecondary} />
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError(null);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onBlur={() => password && validatePassword(password)}
                      placeholder="Password"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showPassword}
                      autoComplete="current-password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      editable={!isSubmitting}
                      style={styles.input}
                      accessibilityLabel="Password"
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.showPasswordButton}
                      disabled={isSubmitting}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon
                        name={showPassword ? 'close' : 'picture'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </Pressable>
                  </View>
                  {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
                </View>

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Primary Login Button */}
                <Pressable
                  onPress={handleLogin}
                  disabled={isSubmitting || isGoogleLoading || !email.trim() || !password}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (isSubmitting || isGoogleLoading || !email.trim() || !password) && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.crust} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Login</Text>
                  )}
                </Pressable>

                {/* Social Auth Buttons */}
                <SocialAuthButtons
                  onGooglePress={handleGoogleSignIn}
                  onApplePress={() => Alert.alert('Apple Sign In', 'Apple Sign In is coming soon.')}
                  onGithubPress={() => Alert.alert('GitHub Sign In', 'GitHub Sign In is coming soon.')}
                  isGoogleLoading={isGoogleLoading}
                  dividerText="or continue with"
                />

                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable disabled={isSubmitting || isGoogleLoading} style={styles.forgotPassLink}>
                    <Text style={[styles.link, (isSubmitting || isGoogleLoading) && styles.linkDisabled]}>
                      Forgot password?
                    </Text>
                  </Pressable>
                </Link>
              </>
            ) : (
              <View style={styles.localAccess}>
                <Text style={styles.formTitle}>Your journal is ready</Text>
                <Text style={styles.localMessage}>
                  Cloud account is optional. You can store your memories privately on this device.
                </Text>
                <Pressable
                  onPress={continueLocally}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Continue without account</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Footer - Sign Up Link */}
          {hasSupabaseConfig && (
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Link href="/(auth)/register" asChild>
                <Pressable disabled={isSubmitting || isGoogleLoading}>
                  <Text style={[styles.signupLink, (isSubmitting || isGoogleLoading) && styles.linkDisabled]}>
                    Sign up
                  </Text>
                </Pressable>
              </Link>
            </View>
          )}
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
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    themeToggle: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    themeToggleText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
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
      gap: 14,
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
      fontSize: 26,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
      marginTop: 4,
    },
    brandTagline: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
      letterSpacing: 0,
      marginTop: 2,
    },
    headerBlock: {
      alignItems: 'center',
      gap: 6,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 12px 36px rgba(0, 0, 0, 0.4)'
              : '0 8px 30px rgba(76, 79, 105, 0.08)',
          } as any)
        : {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.35 : 0.06,
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
      backgroundColor: isDark ? colors.surface1 : colors.background,
      borderRadius: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 50,
      gap: 12,
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
    errorContainer: {
      backgroundColor: colors.errorSoft,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 12,
      padding: 12,
    },
    errorMessage: {
      fontSize: 13,
      color: colors.error,
      textAlign: 'center',
      lineHeight: 18,
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    rememberMeBox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: colors.borderSoft,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    rememberMeBoxChecked: {
      backgroundColor: colors.accent,
    },
    rememberMeIconText: {
      color: colors.accent,
      fontSize: 18,
    },
    rememberMeText: {
      fontSize: 13,
      color: colors.textSecondary,
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
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 4,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderSoft,
    },
    dividerText: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    googleButton: {
      backgroundColor: colors.surfaceOverlay,
      borderRadius: 999,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    googleIcon: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    googleButtonText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: -0.2,
    },
    forgotPassLink: {
      alignSelf: 'center',
      paddingVertical: 4,
    },
    link: {
      fontSize: 14,
      color: colors.accent,
      fontWeight: '600',
    },
    linkDisabled: {
      opacity: 0.5,
    },
    localAccess: {
      gap: 12,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    localMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    signupLink: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
    privacyNote: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
    },
  });
}
