import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/lib/supabase/client';

/**
 * OAuth callback handler
 * This screen handles the redirect from Google OAuth
 */
export default function CallbackScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors.background, colors.textPrimary);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!supabase) {
          setError('Authentication service not configured');
          setTimeout(() => router.replace('/(auth)/login'), 2000);
          return;
        }

        // The session is automatically handled by Supabase
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Ensure profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profile) {
            // Create profile for OAuth user
            const username = session.user.email?.split('@')[0] || 'user';
            const displayName = 
              session.user.user_metadata?.full_name || 
              session.user.user_metadata?.name ||
              session.user.user_metadata?.display_name || 
              username;

            await supabase.from('profiles').insert({
              id: session.user.id,
              username: username.toLowerCase(),
              display_name: displayName,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }

          // Navigate to welcome/onboarding
          router.replace('/(onboarding)/welcome');
        } else {
          setError('Authentication failed. Redirecting...');
          setTimeout(() => router.replace('/(auth)/login'), 2000);
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('An error occurred. Redirecting...');
        setTimeout(() => router.replace('/(auth)/login'), 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <ActivityIndicator size="small" color={colors.textPrimary} style={{ marginTop: 16 }} />
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.text}>Completing sign in...</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function createStyles(background: string, textColor: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    text: {
      fontSize: 16,
      color: textColor,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 14,
      color: '#EF4444',
      textAlign: 'center',
      paddingHorizontal: 32,
    },
  });
}
