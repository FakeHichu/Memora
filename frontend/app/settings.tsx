import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';
import { Icon } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { signOut } from '@/lib/supabase/auth';
import { hasSupabaseConfig } from '@/lib/supabase/client';

export default function SettingsScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const isDark = mode === 'dark';
  const styles = createStyles(colors, isDark);
  const { showToast } = useToast();

  const handleToggleTheme = () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
    showToast({
      message: `Appearance switched to ${nextMode === 'dark' ? 'Catppuccin Mocha (Dark)' : 'Catppuccin Latte (Light)'}`,
      variant: 'default',
      duration: 2000,
    });
  };

  const handleSignOut = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Memora?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          if (hasSupabaseConfig) {
            await signOut();
          }
          showToast({ message: 'Logged out successfully', variant: 'default' });
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
            accessibilityLabel="Back"
          >
            <Icon name="arrow-left" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Settings Card List matching Screen 16 */}
        <View style={styles.card}>
          {/* Account Settings */}
          <Pressable
            style={styles.row}
            onPress={() => router.push('/edit-profile')}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="user" size={18} color={colors.textPrimary} />
              </View>
              <Text style={styles.rowLabel}>Account Settings</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          {/* Notifications */}
          <Pressable
            style={styles.row}
            onPress={() => router.push('/(tabs)/memories')}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="bell" size={18} color={colors.textPrimary} />
              </View>
              <Text style={styles.rowLabel}>Notifications</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          {/* Privacy & Security */}
          <Pressable
            style={styles.row}
            onPress={() =>
              Alert.alert(
                'Privacy & Security',
                'Memora uses end-to-end access controls and isolated circle storage for your class photos.'
              )
            }
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="padlock" size={18} color={colors.textPrimary} />
              </View>
              <Text style={styles.rowLabel}>Privacy & Security</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          {/* Appearance (Dark / Latte) */}
          <Pressable
            style={styles.row}
            onPress={handleToggleTheme}
            accessibilityRole="button"
            accessibilityLabel={`Appearance current: ${mode}`}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="picture" size={18} color={colors.textPrimary} />
              </View>
              <Text style={styles.rowLabel}>Appearance</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.rowValue}>
                {mode === 'dark' ? 'Dark' : 'Latte'}
              </Text>
              <Icon name="chevron-right" size={16} color={colors.textMuted} />
            </View>
          </Pressable>

          <View style={styles.divider} />

          {/* About Memora */}
          <Pressable
            style={styles.row}
            onPress={() =>
              Alert.alert(
                'About Memora',
                'Memora v1.0.0\nYour class. Your people. Your memories.\nA private memory-sharing platform for class communities.'
              )
            }
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="info" size={18} color={colors.textPrimary} />
              </View>
              <Text style={styles.rowLabel}>About Memora</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          {/* Help & Support */}
          <Pressable
            style={styles.row}
            onPress={() =>
              Alert.alert(
                'Help & Support',
                'Need help? Contact support or check out our guide.'
              )
            }
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="info" size={18} color={colors.textPrimary} />
              </View>
              <Text style={styles.rowLabel}>Help & Support</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Log Out button in separate card */}
        <View style={styles.logoutCard}>
          <Pressable
            style={styles.logoutRow}
            onPress={handleSignOut}
            accessibilityRole="button"
          >
            <Icon name="door" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    backButton: {
      padding: 6,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 15,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? colors.surface1 : colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    rowValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    logoutCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    logoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    logoutText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.error,
    },
  });
}
