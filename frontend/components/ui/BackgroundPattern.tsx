import React from 'react';
import { StyleSheet, View, ViewStyle, Text, Platform } from 'react-native';
import { backgroundPattern, colors } from '@/constants/theme';

// Symbol mapping from string codes to actual characters
const SYMBOL_MAP: Record<string, string> = {
  star: '★',
  sparkle: '✦',
  cross: '†',
  heart: '♡',
  diamond: '◇',
  moon: '☾',
  butterfly: '✧',
  circle: '○',
  dot: '•',
};

type BackgroundPatternProps = {
  style?: ViewStyle;
  enabled?: boolean;
  opacity?: number;
  density?: number;
  scale?: number;
  accentIntensity?: number;
};

export function BackgroundPattern({
  style,
  enabled = true,
  opacity = backgroundPattern.defaultOpacity,
  density = backgroundPattern.defaultDensity,
  scale = backgroundPattern.defaultScale,
  accentIntensity = 0,
}: BackgroundPatternProps) {
  // Generate a deterministic but varied pattern
  const patternElements = React.useMemo(() => {
    if (!enabled) return [];
    const symbols = backgroundPattern.symbols.map((s) => SYMBOL_MAP[s] || s);
    const elements: {
      id: string;
      symbol: string;
      x: number;
      y: number;
      rotation: number;
      size: number;
      opacity: number;
      color: string;
    }[] = [];

    const gridSize = 60 / density; // Base grid spacing
    const cols = Math.ceil(400 / gridSize);
    const rows = Math.ceil(800 / gridSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Deterministic pseudo-random based on position
        const seed = row * 1000 + col;
        const rand = (n: number) => {
          const x = Math.sin(n) * 10000;
          return x - Math.floor(x);
        };

        // Skip some positions for organic feel
        if (rand(seed * 1.7) > density) continue;

        // Position with jitter
        const x = col * gridSize + (rand(seed * 2.3) - 0.5) * gridSize * 0.6;
        const y = row * gridSize + (rand(seed * 3.1) - 0.5) * gridSize * 0.6;

        // Skip center area (content zone) - roughly middle 60%
        const centerX = 200;
        const centerY = 400;
        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distFromCenter < 180) continue;

        const symbolIndex = Math.floor(rand(seed * 4.7) * symbols.length);
        const rotation = (rand(seed * 5.3) - 0.5) * 30 * scale;
        const baseSize = 12 + rand(seed * 6.1) * 16;
        const size = baseSize * scale;
        const baseOpacity = opacity * (0.5 + rand(seed * 7.1) * 0.5);

        // Occasionally use accent color
        const useAccent = accentIntensity > 0 && rand(seed * 8.3) < accentIntensity * 0.15;
        const color = useAccent ? colors.accentSoft : colors.chrome;

        elements.push({
          id: `${row}-${col}`,
          symbol: symbols[symbolIndex],
          x,
          y,
          rotation,
          size,
          opacity: baseOpacity,
          color,
        });
      }
    }

    return elements;
  }, [enabled, density, opacity, scale, accentIntensity]);

  if (!enabled || patternElements.length === 0) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.containerWeb, style]} pointerEvents="none">
        {patternElements.map((el) => (
          <Text
            key={el.id}
            style={[
              styles.symbolWeb,
              {
                left: el.x,
                top: el.y,
                transform: [{ rotate: `${el.rotation}deg` }],
                fontSize: el.size,
                opacity: el.opacity,
                color: el.color,
              },
            ]}
          >
            {el.symbol}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {patternElements.map((el) => (
        <Text
          key={el.id}
          style={[
            styles.symbol,
            {
              left: el.x,
              top: el.y,
              transform: [{ rotate: `${el.rotation}deg` }],
              fontSize: el.size,
              opacity: el.opacity,
              color: el.color,
            },
          ]}
        >
          {el.symbol}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  containerWeb: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  symbol: {
    position: 'absolute',
    fontWeight: '300',
    fontFamily: 'System',
    includeFontPadding: false,
    textAlign: 'center',
  },
  symbolWeb: {
    position: 'absolute',
    fontWeight: '300',
    fontFamily: 'System',
    textAlign: 'center',
    userSelect: 'none',
    pointerEvents: 'none',
  },
});
