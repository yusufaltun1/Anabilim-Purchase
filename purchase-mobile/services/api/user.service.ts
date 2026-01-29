import { API_CONFIG, getAuthHeaders } from './api.config';

type UpdateExpoPushTokenRequest = {
  token: string;
};

class UserService {
  private baseUrl = API_CONFIG.BASE_URL;

  async updateExpoPushToken(token: string, authToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/users/me/expo-push-token`, {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify({ token } satisfies UpdateExpoPushTokenRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update push token');
    }
  }
}

export const userService = new UserService();
