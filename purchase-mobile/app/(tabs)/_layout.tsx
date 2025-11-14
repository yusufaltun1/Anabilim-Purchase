import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { TabBarIconWithBadge } from '@/components/navigation/TabBarIconWithBadge';
import { AppColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/contexts/NotificationContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { unreadCount } = useNotifications(); // Okunmamış bildirim sayısını al

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors[colorScheme ?? 'light'].tint,
        headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-requests"
        options={{
          title: 'Taleplerim',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'list' : 'list-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirimler',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWithBadge
              name={focused ? 'notifications' : 'notifications-outline'}
              color={color}
              badgeCount={unreadCount} // Sayıyı prop olarak geçir
            />
          ),
        }}
      />

    </Tabs>
  );
}
