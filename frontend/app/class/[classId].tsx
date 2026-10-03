import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, typography, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function ClassDetailScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Shared class unavailable</Text>
        <Text style={styles.message}>Connect the database before opening shared class details. Your local photos remain available in Memories.</Text>
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
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  message: {
    ...typography.body,
    color: colors.muted,
  },
  });
}
