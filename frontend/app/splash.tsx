import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useAppTheme } from '@/providers/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPLASH_SHOWN_KEY = 'memora.splash_shown.v1';
export default function SplashScreen() {
  const { mode, colors } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let isActive = true;
    AsyncStorage.getItem(SPLASH_SHOWN_KEY).then((shown) => {
      if (!isActive) return;
      if (shown === 'true') {
        setHasCompleted(true);
        return;
      }
      const splashTimeout = setTimeout(async () => {
        if (!isActive) return;
        try {
          AsyncStorage.setItem(SPLASH_SHOWN_KEY, 'true').catch(() => undefined);
          setHasCompleted(true);
          router.replace('/(tabs)/home');
        } catch (err) {
          if (!isActive) return;
          AsyncStorage.setItem(SPLASH_SHOWN_KEY, 'true').catch(() => undefined);
          setHasCompleted(true);
          router.replace('/(tabs)/home');
        }
      }, 2500);
      return () => {
        isActive = false;
        clearTimeout(splashTimeout);
      };
    });
  }, [router, isLoading]);
  if (hasCompleted) {
    return null;
  }
  const isDark = mode === 'dark';
  const backgroundColor = isDark ? '#0B0813' : '#F7F2E9';
  const textColor = isDark ? '#F6F0FF' : '#30243D';
  const accentColor = isDark ? '#8052C8' : '#80658F';
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Memora Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>MEMORA</Text>
        </View>
        {/* Application Name */}
        <Text style={styles.appName}>Memora</Text>
        {/* Tagline */}
        <Text style={styles.tagline}>Your memories, together.</Text>
        {/* Subtle loading animation */}
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={accentColor}
            style={styles.activityIndicator}
          />
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0813',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(128, 82, 200, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#8052C8',
    letterSpacing: -0.5,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F6F0FF',
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 14,
    color: '#A99BB9',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  activityIndicator: {
    marginTop: 20,
  },
});