import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export function HeartMark({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" accessibilityLabel="Memora heart logo">
      <Defs>
        <LinearGradient id="memoraHeart" x1="12" y1="16" x2="88" y2="90" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#B9A2FF" />
          <Stop offset="1" stopColor="#8052C8" />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 86C40 78 16 61 16 43c0-14 15-22 27-13 4 3 7 8 7 13 1-6 5-12 10-15 12-7 26 1 26 15 0 18-24 34-36 43Z"
        stroke="url(#memoraHeart)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M50 79C41 72 27 61 27 48c0-9 9-14 17-9 3 2 5 5 6 9 2-5 6-9 11-10 8-2 15 4 15 12 0 12-15 23-26 29Z"
        stroke="url(#memoraHeart)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.88}
      />
    </Svg>
  );
}
