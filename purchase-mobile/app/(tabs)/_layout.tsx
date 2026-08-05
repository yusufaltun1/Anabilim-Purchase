import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { TabBarIconWithBadge } from '@/components/navigation/TabBarIconWithBadge';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { purchaseService } from '@/services/api/purchase.service';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const { unreadCount } = useNotifications();
  const { canApprove } = useCapabilities();
  const { token, isAuthenticated } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!canApprove || !isAuthenticated || !token) {
        if (!cancelled) setPendingCount(0);
        return;
      }
      try {
        const list = await purchaseService.getPendingApprovals(token);
        if (!cancelled) setPendingCount(list.length);
      } catch {
        if (!cancelled) setPendingCount(0);
      }
    };
    void load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [canApprove, isAuthenticated, token]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-requests"
        options={{
          title: 'Talepler',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'list' : 'list-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pending-approvals"
        options={{
          title: 'Onay',
          href: canApprove ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWithBadge
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
              color={color}
              badgeCount={pendingCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Daha fazla',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'grid' : 'grid-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirim',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWithBadge
              name={focused ? 'notifications' : 'notifications-outline'}
              color={color}
              badgeCount={unreadCount}
            />
          ),
        }}
      />
    </Tabs>
  );
}
