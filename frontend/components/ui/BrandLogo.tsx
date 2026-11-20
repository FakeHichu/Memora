import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { HeartMark } from './HeartMark';
import { useAppTheme } from '@/providers/ThemeProvider';

export type BrandLogoVariant = 'icon' | 'horizontal' | 'stacked' | 'pill';

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: number;
  textColor?: string;
  tagline?: string;
  style?: StyleProp<ViewStyle>;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'icon',
  size = 40,
  textColor,
  tagline,
  style,
}) => {
  const { colors } = useAppTheme();
  const textCol = textColor || colors.textPrimary;

  if (variant === 'horizontal') {
    return (
      <View style={[styles.horizontalContainer, style]}>
        <HeartMark size={size} />
        <View style={styles.textColumn}>
          <Text style={[styles.wordmark, { color: textCol, fontSize: Math.round(size * 0.6) }]}>
            Memora
          </Text>
          {tagline ? (
            <Text style={[styles.taglineText, { color: colors.textSecondary }]}>
              {tagline}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (variant === 'stacked') {
    return (
      <View style={[styles.stackedContainer, style]}>
        <HeartMark size={size} />
        <Text
          style={[
            styles.wordmark,
            styles.stackedWordmark,
            { color: textCol, fontSize: Math.round(size * 0.45) },
          ]}
        >
          Memora
        </Text>
        {tagline ? (
          <Text style={[styles.taglineText, { color: colors.textSecondary }]}>
            {tagline}
          </Text>
        ) : null}
      </View>
    );
  }

  if (variant === 'pill') {
    return (
      <View
        style={[
          styles.pillContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
          style,
        ]}
      >
        <HeartMark size={Math.round(size * 0.7)} />
        <View style={styles.pillTextColumn}>
          <Text style={[styles.pillTitle, { color: textCol }]}>Memora</Text>
          {tagline ? (
            <Text style={[styles.pillTagline, { color: colors.textMuted }]}>
              {tagline}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  // Default: 'icon'
  return (
    <View style={[styles.iconContainer, style]}>
      <HeartMark size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textColumn: {
    justifyContent: 'center',
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  stackedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedWordmark: {
    marginTop: 10,
    textAlign: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    gap: 8,
  },
  pillTextColumn: {
    justifyContent: 'center',
  },
  pillTitle: {
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  pillTagline: {
    fontSize: 10,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
