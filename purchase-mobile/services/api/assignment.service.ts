import * as FileSystem from 'expo-file-system/legacy';
import { Linking } from 'react-native';
import { API_CONFIG, getAuthHeaders, getAuthHeadersMultipart } from './api.config';
import type { Assignment } from '../types/product.types';
import type {
  CreateAssignmentRequest,
  ReturnAssignmentPayload,
} from '../types/assignment.types';

function unwrapAssignment(data: unknown): Assignment {
  if (data && typeof data === 'object' && 'data' in data) {
    const nested = (data as { data?: unknown }).data;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested as Assignment;
    }
  }
  return data as Assignment;
}

function unwrapAssignmentList(data: unknown): Assignment[] {
  if (Array.isArray(data)) return data as Assignment[];
  if (data && typeof data === 'object') {
    const obj = data as { data?: unknown };
    if (Array.isArray(obj.data)) return obj.data as Assignment[];
  }
  return [];
}

function rnFilePart(
  uri: string,
  name: string,
  mimeType: string
): { uri: string; name: string; type: string } {
  return { uri, name, type: mimeType };
}

class AssignmentService {
  private readonly basePath = '/api/v1/assignments';

  private url(path = ''): string {
    return `${API_CONFIG.BASE_URL}${this.basePath}${path}`;
  }

  async createAssignment(payload: CreateAssignmentRequest, token: string): Promise<Assignment> {
    const response = await fetch(this.url(), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Zimmet oluşturulamadı (${response.status})`
      );
    }
    return unwrapAssignment(data);
  }

  async cancelAssignment(id: number, token: string): Promise<void> {
    const response = await fetch(this.url(`/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || `Zimmet iptal edilemedi (${response.status})`
      );
    }
  }

  async returnAssignment(
    id: number,
    payload: ReturnAssignmentPayload,
    token: string
  ): Promise<Assignment> {
    const formData = new FormData();
    formData.append(
      'photo',
      rnFilePart(
        payload.photoUri,
        payload.photoName || `iade-foto-${id}.jpg`,
        payload.photoMimeType || 'image/jpeg'
      ) as unknown as Blob
    );
    if (payload.documentUri) {
      formData.append(
        'document',
        rnFilePart(
          payload.documentUri,
          payload.documentName || `iade-form-${id}.xlsx`,
          payload.documentMimeType ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) as unknown as Blob
      );
    }
    formData.append('warehouseId', String(payload.warehouseId));
    if (payload.notes?.trim()) {
      formData.append('notes', payload.notes.trim());
    }

    const response = await fetch(this.url(`/${id}/return`), {
      method: 'POST',
      headers: getAuthHeadersMultipart(token),
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Zimmet iade edilemedi (${response.status})`
      );
    }
    return unwrapAssignment(data);
  }

  async getAssignmentsByStockItem(stockItemId: number, token: string): Promise<Assignment[]> {
    const response = await fetch(this.url(`/stock-item/${stockItemId}`), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Zimmetler yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapAssignmentList(data);
  }

  async getAssignmentsByLocationId(locationId: number, token: string): Promise<Assignment[]> {
    const response = await fetch(this.url(`/location/${locationId}`), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Konum zimmetleri yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapAssignmentList(data);
  }

  async getActiveAssignmentsByUserId(userId: number, token: string): Promise<Assignment[]> {
    const response = await fetch(this.url(`/user/${userId}/active`), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Kullanıcı zimmetleri yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapAssignmentList(data);
  }

  async downloadAssignmentForm(id: number, token: string): Promise<string> {
    return this.downloadBinary(`/form/download`, id, token, `Zimmet_Formu_${id}.xlsx`);
  }

  async downloadReturnAssignmentForm(id: number, token: string): Promise<string> {
    return this.downloadBinary(`/return/form/download`, id, token, `Zimmet_Iade_Formu_${id}.xlsx`);
  }

  private async downloadBinary(
    pathSuffix: string,
    id: number,
    token: string,
    fallbackName: string
  ): Promise<string> {
    const cacheDir = FileSystem.cacheDirectory ?? '';
    const localUri = `${cacheDir}${fallbackName}`;
    const { uri, status } = await FileSystem.downloadAsync(
      this.url(`/${id}${pathSuffix}`),
      localUri,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (status < 200 || status >= 300) {
      throw new Error(`Dosya indirilemedi (${status})`);
    }
    try {
      const canOpen = await Linking.canOpenURL(uri);
      if (canOpen) {
        await Linking.openURL(uri);
      }
    } catch {
      // best-effort open; uri still returned for share/fallback
    }
    return uri;
  }

  async uploadSignedForm(id: number, fileUri: string, fileName: string, token: string): Promise<void> {
    const formData = new FormData();
    formData.append(
      'file',
      rnFilePart(
        fileUri,
        fileName || `imzali-zimmet-${id}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) as unknown as Blob
    );
    const response = await fetch(this.url(`/${id}/form/signed`), {
      method: 'POST',
      headers: getAuthHeadersMultipart(token),
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || `İmzalı form yüklenemedi (${response.status})`
      );
    }
  }

  async uploadFormPhoto(
    id: number,
    photoUri: string,
    photoName: string | undefined,
    photoMimeType: string | undefined,
    token: string
  ): Promise<void> {
    const formData = new FormData();
    formData.append(
      'file',
      rnFilePart(
        photoUri,
        photoName || `zimmet-foto-${id}.jpg`,
        photoMimeType || 'image/jpeg'
      ) as unknown as Blob
    );
    const response = await fetch(this.url(`/${id}/form/photo`), {
      method: 'POST',
      headers: getAuthHeadersMultipart(token),
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || `Fotoğraf yüklenemedi (${response.status})`
      );
    }
  }
}

export const assignmentService = new AssignmentService();
