import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography, borders } from '@/constants/theme';

export const REACTION_EMOJIS = [
  { type: 'heart', emoji: '❤️', label: 'Love' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
  { type: 'respect', emoji: '🫡', label: 'Respect' },
  { type: 'cry', emoji: '😭', label: 'Cry' },
  { type: 'dead', emoji: '💀', label: 'Dead' },
];

type ReactionBarProps = {
  reactions?: Record<string, number>;
  userReaction?: string | null;
  onReact: (emoji: string) => void;
  compact?: boolean;
};

export function ReactionBar({
  reactions = {},
  userReaction = null,
  onReact,
  compact = false,
}: ReactionBarProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {REACTION_EMOJIS.map(({ emoji, label }) => {
        const count = reactions[emoji] || 0;
        const isSelected = userReaction === emoji;

        return (
          <Pressable
            key={emoji}
            onPress={() => onReact(emoji)}
            style={[
              styles.pill,
              compact && styles.pillCompact,
              isSelected && styles.pillSelected,
              count > 0 && !isSelected && styles.pillActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${label} reaction, ${count} count`}
          >
            <Text style={[styles.emoji, compact && styles.emojiCompact]}>{emoji}</Text>
            {count > 0 && (
              <Text
                style={[
                  styles.count,
                  compact && styles.countCompact,
                  isSelected && styles.countSelected,
                ]}
              >
                {count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginVertical: spacing.sm,
  },
  containerCompact: {
    gap: 4,
    marginVertical: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  pillCompact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 2,
  },
  pillSelected: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
    borderWidth: borders.thin,
  },
  pillActive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDefault,
  },
  emoji: {
    fontSize: 16,
  },
  emojiCompact: {
    fontSize: 13,
  },
  count: {
    ...typography.sans.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: 12,
  },
  countCompact: {
    fontSize: 10,
  },
  countSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
});