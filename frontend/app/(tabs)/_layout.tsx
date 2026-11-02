import { Tabs } from 'expo-router';
import React from 'react';
<<<<<<< HEAD
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borders, colors, radius, spacing, shadows, webShadows } from '@/constants/theme';
import { TabIcon } from '@/components/ui/Icons';
import { MemoraTabBar } from '@/components/ui/MemoraTabBar';

const MIN_TAB_BAR_HEIGHT = 56;
const TAB_LABEL_HEIGHT = 16;
=======
import { MemoraTabBar } from '@/components/ui/MemoraTabBar';
>>>>>>> 43255a2418f1652568805f39f8139aaa2f03c8c4

export default function TabsLayout() {
  return (
    <Tabs
<<<<<<< HEAD
      tabBar={MemoraTabBar}
=======
      tabBar={(props) => <MemoraTabBar {...props} />}
>>>>>>> 43255a2418f1652568805f39f8139aaa2f03c8c4
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarAccessibilityLabel: 'Memories tab',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarAccessibilityLabel: 'Create memory',
        }}
      />
      <Tabs.Screen
        name="circle"
        options={{
          title: 'Circle',
          tabBarAccessibilityLabel: 'Circle tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
      <Tabs.Screen name="class" options={{ href: null }} />
      <Tabs.Screen name="today" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="yearbook" options={{ href: null }} />
    </Tabs>
  );
}
