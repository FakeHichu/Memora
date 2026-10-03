import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { radius, spacing, typography, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function JoinClassScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [code, setCode] = useState('7K9A-PQ2T');

  const handleJoin = () => {
    router.replace('/(tabs)/today');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Join class</Text>
        <Text style={styles.title}>Enter your class code</Text>

        <Card style={styles.card}>
          <Text style={styles.fieldLabel}>Class join code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            placeholderTextColor={colors.muted}
            style={styles.input}
            placeholder="ABCD-1234"
          />

          <Button title="Join class" onPress={handleJoin} />
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  kicker: {
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginVertical: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16,
    letterSpacing: 1.5,
    color: colors.text,
  },
  helperWrap: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.glass,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helperTitle: {
    ...typography.subheading,
    marginBottom: spacing.sm,
  },
  helperText: {
    ...typography.body,
    color: colors.muted,
  },
  });
}
