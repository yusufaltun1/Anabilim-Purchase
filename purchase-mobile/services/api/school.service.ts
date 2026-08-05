import { API_CONFIG, getAuthHeaders } from './api.config';
import {
  mapApiToSchool,
  type CreateSchoolRequest,
  type PaginatedSchoolResponse,
  type School,
  type SchoolSearchParams,
  type UpdateSchoolRequest,
} from '../types/school.types';

function unwrapEntity(data: unknown): Record<string, unknown> {
  if (data && typeof data === 'object' && 'data' in data && (data as { data: unknown }).data) {
    return (data as { data: Record<string, unknown> }).data;
  }
  return (data as Record<string, unknown>) ?? {};
}

function normalizeList(data: unknown): School[] {
  const raw = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown[] }).data
      : data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)
        ? (data as { content: unknown[] }).content
        : [];
  return raw.map((item) => mapApiToSchool(item as Record<string, unknown>));
}

function normalizePaginated(data: unknown): PaginatedSchoolResponse {
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    const page = data as PaginatedSchoolResponse & { content: unknown[] };
    return {
      content: page.content.map((item) => mapApiToSchool(item as Record<string, unknown>)),
      totalElements: Number(page.totalElements) || 0,
      totalPages: Number(page.totalPages) || 0,
      size: Number(page.size) || 0,
      number: Number(page.number) || 0,
      first: Boolean(page.first),
      last: Boolean(page.last),
    };
  }
  const list = normalizeList(data);
  return {
    content: list,
    totalElements: list.length,
    totalPages: 1,
    size: list.length,
    number: 0,
    first: true,
    last: true,
  };
}

function buildQuery(params?: SchoolSearchParams): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append('query', params.query);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
}

class SchoolService {
  private baseUrl = API_CONFIG.BASE_URL;

  async createSchool(data: CreateSchoolRequest, token: string): Promise<School> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string; error?: string })?.message ||
          (json as { error?: string })?.error ||
          `Okul oluşturulamadı (${response.status})`
      );
    }
    return mapApiToSchool(unwrapEntity(json));
  }

  async updateSchool(id: number, data: UpdateSchoolRequest, token: string): Promise<School> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Okul güncellenemedi (${response.status})`
      );
    }
    return mapApiToSchool(unwrapEntity(json));
  }

  async deleteSchool(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.BY_ID(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(
        (json as { message?: string })?.message || `Okul silinemedi (${response.status})`
      );
    }
  }

  async getSchoolById(id: number, token: string): Promise<School> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.BY_ID(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Okul bulunamadı (${response.status})`
      );
    }
    return mapApiToSchool(unwrapEntity(json));
  }

  async getAllSchools(
    token: string,
    params?: SchoolSearchParams
  ): Promise<PaginatedSchoolResponse> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.BASE}${buildQuery(params)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Okullar yüklenemedi (${response.status})`);
    }
    return normalizePaginated(await response.json());
  }

  async getActiveSchools(token: string): Promise<School[]> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.ACTIVE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Aktif okullar yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async searchSchools(
    token: string,
    params: SchoolSearchParams
  ): Promise<PaginatedSchoolResponse> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.SEARCH}${buildQuery(params)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Okul araması başarısız (${response.status})`);
    }
    return normalizePaginated(await response.json());
  }

  async getSchoolsByCity(city: string, token: string): Promise<School[]> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.BY_CITY(city)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Şehire göre okullar yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getSchoolsByDistrict(district: string, token: string): Promise<School[]> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.BY_DISTRICT(district)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`İlçeye göre okullar yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getSchoolsByType(schoolType: string, token: string): Promise<School[]> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.SCHOOLS.BY_TYPE(schoolType)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Türe göre okullar yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }
}

export const schoolService = new SchoolService();
