import { ViewStyle } from 'react-native';

type BackgroundPatternProps = {
  style?: ViewStyle;
  enabled?: boolean;
  opacity?: number;
  density?: number;
  scale?: number;
  accentIntensity?: number;
};

// Clean iOS design - pristine background without gothic pattern noise
export function BackgroundPattern(_props: BackgroundPatternProps) {
  return null;
}
