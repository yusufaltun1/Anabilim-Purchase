import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ToastProvider } from '@/components/ui';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <ToastProvider>
              <Stack
                initialRouteName="login"
                screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}
              >
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen name="ui-kit" options={{ title: 'UI Kit', headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ToastProvider>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
