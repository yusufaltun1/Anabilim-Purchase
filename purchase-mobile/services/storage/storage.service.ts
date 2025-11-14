import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo } from '../types/auth.types';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
};

class StorageService {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  // Auth specific methods
  async saveAuthData(token: string, refreshToken: string | null, userInfo: UserInfo): Promise<void> {
    const promises = [
      this.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
      this.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo)),
    ];

    // refreshToken null ise kaydetme, dolu ise kaydet
    if (refreshToken) {
      promises.push(this.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken));
    } else {
      // Eğer refreshToken null gelirse, depodaki eski değeri temizle
      promises.push(this.removeItem(STORAGE_KEYS.REFRESH_TOKEN));
    }

    await Promise.all(promises);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async getUserInfo(): Promise<UserInfo | null> {
    const userInfoStr = await this.getItem(STORAGE_KEYS.USER_INFO);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  }

  async clearAuthData(): Promise<void> {
    await Promise.all([
      this.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      this.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      this.removeItem(STORAGE_KEYS.USER_INFO),
    ]);
  }
}

export const storageService = new StorageService();
