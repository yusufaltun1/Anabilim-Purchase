import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { userService } from '@/services/api/user.service';

const getProjectId = (): string | undefined =>
  Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

const requestPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

const getExpoPushToken = async (): Promise<string | null> => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    return null;
  }

  await ensureAndroidChannel();

  const projectId = getProjectId();
  const tokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();
  return tokenResponse.data;
};

export const registerDeviceForPushNotifications = async (authToken: string): Promise<void> => {
  try {
    const expoPushToken = await getExpoPushToken();
    if (!expoPushToken) {
      return;
    }

    await userService.updateExpoPushToken(expoPushToken, authToken);
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
};
