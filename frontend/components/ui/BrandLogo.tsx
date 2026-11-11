import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export type BrandLogoVariant = 'icon' | 'horizontal' | 'stacked' | 'pill';

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: number;
  textColor?: string;
  tagline?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'icon',
  size = 40,
  textColor = '#F6F0FF',
  tagline,
  style,
  imageStyle,
}) => {
  if (variant === 'horizontal') {
    return (
      <View style={[styles.horizontalContainer, style]}>
        <Image
          source={require('@/assets/brand/logo-cat.png')}
          style={[
            styles.catIcon,
            { width: size, height: size, borderRadius: Math.round(size * 0.28) },
            imageStyle,
          ]}
          resizeMode="cover"
        />
        <View style={styles.textColumn}>
          <Text style={[styles.wordmark, { color: textColor, fontSize: Math.round(size * 0.52) }]}>
            memora
          </Text>
          {tagline ? <Text style={styles.taglineText}>{tagline}</Text> : null}
        </View>
      </View>
    );
  }

  if (variant === 'stacked') {
    return (
      <View style={[styles.stackedContainer, style]}>
        <Image
          source={require('@/assets/brand/logo-cat.png')}
          style={[
            styles.catIcon,
            { width: size, height: size, borderRadius: Math.round(size * 0.28) },
            imageStyle,
          ]}
          resizeMode="cover"
        />
        <Text
          style={[
            styles.wordmark,
            styles.stackedWordmark,
            { color: textColor, fontSize: Math.round(size * 0.32) },
          ]}
        >
          memora
        </Text>
        {tagline ? <Text style={styles.taglineText}>{tagline}</Text> : null}
      </View>
    );
  }

  if (variant === 'pill') {
    return (
      <View style={[styles.pillContainer, style]}>
        <Image
          source={require('@/assets/brand/logo-cat.png')}
          style={[
            styles.catIcon,
            { width: size, height: size, borderRadius: Math.round(size * 0.28) },
            imageStyle,
          ]}
          resizeMode="cover"
        />
        <View>
          <Text style={[styles.pillTitle, { color: textColor }]}>MEMORA</Text>
          {tagline ? <Text style={styles.pillTagline}>{tagline}</Text> : null}
        </View>
      </View>
    );
  }

  // Default: 'icon'
  return (
    <View
      style={[
        styles.iconContainer,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
        },
        style,
      ]}
    >
      <Image
        source={require('@/assets/brand/logo-cat.png')}
        style={[
          styles.catIcon,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.28),
          },
          imageStyle,
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    overflow: 'hidden',
    backgroundColor: '#0E0D17',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 82, 200, 0.35)',
  },
  catIcon: {
    backgroundColor: '#0E0D17',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textColumn: {
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: 'System',
    fontWeight: '700',
    letterSpacing: -0.5,
    textTransform: 'lowercase',
  },
  stackedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stackedWordmark: {
    letterSpacing: -0.2,
  },
  taglineText: {
    fontSize: 11,
    color: '#A097B6',
    fontWeight: '500',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pillTagline: {
    fontSize: 12,
    color: '#A097B6',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

