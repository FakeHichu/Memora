import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { ThemeColors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function IndexScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // If Supabase is configured and user is logged in, or if using local mode, go to home
  const targetRoute = !hasSupabaseConfig || session ? '/(tabs)/home' : '/(auth)/login';

  return <Redirect href={targetRoute} />;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  });
}
