import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';

class FileUploadService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Resim yüklenirken hata oluştu');
      }

      const data = await response.json();
      return data.imageUrl; // Backend'den dönen URL
    } catch (error: any) {
      throw new Error(error.message || 'Resim yüklenirken hata oluştu');
    }
  }
}

export const fileUploadService = new FileUploadService();
