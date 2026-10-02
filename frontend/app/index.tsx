import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { hasSupabaseConfig } from '@/lib/supabase/client';

export default function IndexScreen() {
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
