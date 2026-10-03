import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, typography, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function ClassScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Shared classes</Text>
        <Text style={styles.message}>Class sharing is not connected yet. Your photo journal works privately on this device.</Text>
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
    gap: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  message: {
    color: colors.muted,
    ...typography.body,
  },
  });
}
