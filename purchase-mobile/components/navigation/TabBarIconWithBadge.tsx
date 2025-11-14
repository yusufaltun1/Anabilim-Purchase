import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TabBarIconWithBadgeProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  badgeCount: number;
}

export const TabBarIconWithBadge: React.FC<TabBarIconWithBadgeProps> = ({ name, color, badgeCount }) => {
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <Ionicons size={28} name={name} color={color} style={{ marginBottom: -3 }} />
      {badgeCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <ThemedText style={styles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    margin: 'auto',
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -3,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
