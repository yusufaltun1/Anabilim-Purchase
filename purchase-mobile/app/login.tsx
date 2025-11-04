import { LoginForm } from '@/components/forms/LoginForm';
import { AppColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const handleLoginSuccess = () => {
    // Login başarılı olduğunda ana sayfaya yönlendir
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
