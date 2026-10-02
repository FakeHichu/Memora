import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

export default function JoinClassScreen() {
  const [code, setCode] = useState('7K9A-PQ2T');

  const handleJoin = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Join class</Text>
        <Text style={styles.title}>Enter your class code</Text>

        <Card style={styles.card} variant="editorial">
          <Text style={styles.fieldLabel}>Class join code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            style={styles.input}
            placeholder="ABCD-1234"
          />

          <Button title="Join class" onPress={handleJoin} variant="accent" />
        </Card>

        <View style={styles.helperWrap}>
          <Text style={styles.helperTitle}>Private by design</Text>
          <Text style={styles.helperText}>
            The backend verifies the join code and checks class membership before granting access.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  title: {
    ...typography.serif.title,
    color: colors.textPrimary,
    marginVertical: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
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
    borderWidth: 0.5,
    borderColor: colors.borderChrome,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
    ...typography.mono.body,
  },
  helperWrap: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSubtle,
    borderWidth: 0.5,
    borderColor: 'rgba(184, 79, 125, 0.2)',
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
  },
});
