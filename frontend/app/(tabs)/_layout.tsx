import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E8E0DA',
          height: 78,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: () => <Text>📸</Text>,
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarIcon: () => <Text>🗓️</Text>,
        }}
      />
      <Tabs.Screen
        name="class"
        options={{
          title: 'Class',
          href: null,
          tabBarIcon: () => <Text>🏫</Text>,
        }}
      />
      <Tabs.Screen
        name="yearbook"
        options={{
          title: 'Yearbook',
          tabBarIcon: () => <Text>📚</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tabs>
  );
}
