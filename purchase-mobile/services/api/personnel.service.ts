import { API_CONFIG, getAuthHeaders } from './api.config';
import {
  mapApiToPersonnel,
  type CreatePersonnelRequest,
  type PaginatedPersonnelResponse,
  type PersonnelSearchParams,
  type SchoolPersonnel,
  type UpdatePersonnelRequest,
} from '../types/personnel.types';

function unwrapEntity(data: unknown): Record<string, unknown> {
  if (data && typeof data === 'object' && 'data' in data && (data as { data: unknown }).data) {
    return (data as { data: Record<string, unknown> }).data;
  }
  return (data as Record<string, unknown>) ?? {};
}

function normalizeList(data: unknown): SchoolPersonnel[] {
  const raw = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown[] }).data
      : data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)
        ? (data as { content: unknown[] }).content
        : [];
  return raw.map((item) => mapApiToPersonnel(item as Record<string, unknown>));
}

function normalizePaginated(data: unknown): PaginatedPersonnelResponse {
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    const page = data as PaginatedPersonnelResponse & { content: unknown[] };
    return {
      content: page.content.map((item) => mapApiToPersonnel(item as Record<string, unknown>)),
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

function buildQuery(params?: PersonnelSearchParams): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append('query', params.query);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
}

class PersonnelService {
  private baseUrl = API_CONFIG.BASE_URL;

  async createPersonnel(data: CreatePersonnelRequest, token: string): Promise<SchoolPersonnel> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string; error?: string })?.message ||
          (json as { error?: string })?.error ||
          `Personel oluşturulamadı (${response.status})`
      );
    }
    return mapApiToPersonnel(unwrapEntity(json));
  }

  async updatePersonnel(
    id: number,
    data: UpdatePersonnelRequest,
    token: string
  ): Promise<SchoolPersonnel> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Personel güncellenemedi (${response.status})`
      );
    }
    return mapApiToPersonnel(unwrapEntity(json));
  }

  async deletePersonnel(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BY_ID(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(
        (json as { message?: string })?.message || `Personel silinemedi (${response.status})`
      );
    }
  }

  async getPersonnelById(id: number, token: string): Promise<SchoolPersonnel> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BY_ID(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Personel bulunamadı (${response.status})`
      );
    }
    return mapApiToPersonnel(unwrapEntity(json));
  }

  async getAllPersonnel(
    token: string,
    params?: PersonnelSearchParams
  ): Promise<PaginatedPersonnelResponse> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BASE}${buildQuery(params)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Personel listesi yüklenemedi (${response.status})`);
    }
    return normalizePaginated(await response.json());
  }

  async getActivePersonnel(token: string): Promise<SchoolPersonnel[]> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.ACTIVE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Aktif personel yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async searchPersonnel(
    token: string,
    params: PersonnelSearchParams
  ): Promise<PaginatedPersonnelResponse> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.SEARCH}${buildQuery(params)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Personel araması başarısız (${response.status})`);
    }
    return normalizePaginated(await response.json());
  }

  async getPersonnelBySchool(
    schoolId: number,
    token: string,
    params?: PersonnelSearchParams
  ): Promise<PaginatedPersonnelResponse> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BY_SCHOOL(schoolId)}${buildQuery(params)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Okula göre personel yüklenemedi (${response.status})`);
    }
    return normalizePaginated(await response.json());
  }

  async getPersonnelByRole(role: string, token: string): Promise<SchoolPersonnel[]> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BY_ROLE(role)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Role göre personel yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getPersonnelByStatus(status: string, token: string): Promise<SchoolPersonnel[]> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BY_STATUS(status)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Duruma göre personel yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getPersonnelByEmploymentType(
    employmentType: string,
    token: string
  ): Promise<SchoolPersonnel[]> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.PERSONNEL.BY_EMPLOYMENT_TYPE(employmentType)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`İstihdam türüne göre personel yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }
}

export const personnelService = new PersonnelService();
