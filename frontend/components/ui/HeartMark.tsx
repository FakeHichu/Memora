import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useAppTheme } from '@/providers/ThemeProvider';

export interface HeartMarkProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

export function HeartMark({ size = 56, color, secondaryColor }: HeartMarkProps) {
  const { colors, mode } = useAppTheme();
  const gradId = `memoraHeart_${mode}_${Math.round(size)}`;

  const c1 = color || (mode === 'dark' ? '#B4BEFE' : '#7287FD');
  const c2 = secondaryColor || (mode === 'dark' ? '#CBA6F7' : '#8839EF');

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      accessibilityLabel="Memora heart logo"
    >
      <Defs>
        <LinearGradient id={gradId} x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={c1} />
          <Stop offset="100%" stopColor={c2} />
        </LinearGradient>
      </Defs>

      {/* Outer loop of intertwined heart */}
      <Path
        d="M60 98 C45 86 16 68 16 42 C16 24 32 14 47 24 C53 28 58 35 60 40 C62 35 67 28 73 24 C88 14 104 24 104 42 C104 68 75 86 60 98 Z"
        stroke={`url(#${gradId})`}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner intertwined ribbon contour */}
      <Path
        d="M60 88 C48 78 28 62 28 44 C28 32 39 24 50 31 C55 34 58 39 60 44 C62 39 65 34 70 31 C81 24 92 32 92 44 C92 62 72 78 60 88 Z"
        stroke={`url(#${gradId})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </Svg>
  );
}
