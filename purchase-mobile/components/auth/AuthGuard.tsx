import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  // Loading durumunda spinner göster
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Kullanıcı giriş yapmamışsa hiçbir şey gösterme (redirect olacak)
  if (!isAuthenticated) {
    return null;
  }

  // Kullanıcı giriş yapmışsa children'ı render et
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
