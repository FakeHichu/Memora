import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon } from '@/components/ui/Icons';
import { hasSupabaseConfig, supabase } from '@/lib/supabase/client';
export default function SplashScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [readyToNavigate, setReadyToNavigate] = useState(false);
  const [destinationRoute, setDestinationRoute] = useState<string>('/(auth)/login');
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.85));
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [progressAnim] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
    async function checkAuthAndNavigate() {
      let targetRoute = '/(auth)/login';
      if (hasSupabaseConfig && supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data.session) {
            targetRoute = '/(tabs)/home';
          }
        } catch (err) {
          console.warn('Auth check failed:', err);
        }
      } else {
        targetRoute = '/(tabs)/home';
      }
      setDestinationRoute(targetRoute);
    }
    checkAuthAndNavigate();
    const timer = setTimeout(() => {
      setReadyToNavigate(true);
    }, 2500);
    return () => {
      pulseLoop.stop();
      clearTimeout(timer);
    };
  }, [fadeAnim, scaleAnim, pulseAnim, progressAnim]);
  useEffect(() => {
    if (readyToNavigate) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace(destinationRoute as any);
      });
    }
  }, [readyToNavigate, fadeAnim, destinationRoute]);
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Ambient background glow */}
        <View style={styles.ambientGlow} />
        {/* Center branding */}
        <View style={styles.centerContainer}>
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
              },
            ]}
          >
            <View style={styles.logoBadge}>
              <Image
                source={require('@/assets/brand/logo-cat.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </Animated.View>
          <Text style={styles.appName}>Memora</Text>
          <Text style={styles.appTagline}>Capture & relive every moment</Text>
          {/* WhatsApp-style mini progress indicator */}
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
        </View>
        {/* WhatsApp-style bottom footer */}
        <View style={styles.footer}>
          <Text style={styles.footerPrefix}>FROM</Text>
          <Text style={styles.footerBrand}>MEMORA</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    ambientGlow: {
      position: 'absolute',
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: colors.accent,
      opacity: 0.12,
      top: '30%',
      alignSelf: 'center',
      ...(Platform.OS === 'web' ? ({ filter: 'blur(70px)' } as any) : {}),
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    logoWrapper: {
      marginBottom: 24,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 8,
    },
    logoBadge: {
      width: 92,
      height: 92,
      borderRadius: 28,
      backgroundColor: '#0E0D17',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.accentLight,
      overflow: 'hidden',
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: `0 12px 32px ${colors.accentGlow || 'rgba(128, 82, 200, 0.3)'}`,
          } as any)
        : {}),
    },
    logoImage: {
      width: 92,
      height: 92,
      borderRadius: 28,
    },
    appName: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.5,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
      marginBottom: 6,
    },
    appTagline: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '400',
      marginBottom: 32,
    },
    progressBarTrack: {
      width: 140,
      height: 3,
      backgroundColor: colors.borderDefault,
      borderRadius: 999,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 999,
    },
    footer: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    footerPrefix: {
      fontSize: 11,
      fontWeight: '500',
      letterSpacing: 2,
      color: colors.textMuted,
    },
    footerBrand: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 3,
      color: colors.textPrimary,
    },
  });
}