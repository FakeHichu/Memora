import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

type AvatarProps = {
  name: string;
  size?: number;
  photoUri?: string;
  tint?: string;
  ring?: boolean;
};

export function Avatar({ name, size = 44, photoUri, tint, ring = false }: AvatarProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? 2 : 0,
          padding: ring ? 2 : 0,
          borderColor: ring ? colors.primary : 'transparent',
        },
      ]}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} accessibilityLabel={`${name} profile photo`} />
      ) : (
        <View style={[styles.initials, { backgroundColor: tint ?? colors.surface }]}>
          <Text style={[styles.initialsText, { fontSize: Math.max(12, size * 0.3) }]}>{initials || 'M'}</Text>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  initials: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  initialsText: {
    color: colors.text,
    fontWeight: '700',
  },
  });
}
