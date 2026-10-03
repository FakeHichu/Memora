import { Tabs } from 'expo-router';
import React from 'react';

import { MemoraTabBar } from '@/components/ui/MemoraTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <MemoraTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="today" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="memories" options={{ title: 'Memories' }} />
      <Tabs.Screen name="profile" options={{ title: 'Me' }} />
      <Tabs.Screen name="class" options={{ href: null }} />
      <Tabs.Screen name="yearbook" options={{ href: null }} />
    </Tabs>
  );
}
