import { API_CONFIG, getAuthHeaders } from './api.config';
import {
  mapApiToSupplier,
  type CreateSupplierRequest,
  type Supplier,
  type UpdateSupplierRequest,
} from '../types/supplier.types';

function normalizeList(data: unknown): Supplier[] {
  const raw = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as any).data)
      ? (data as any).data
      : [];
  return raw.map(mapApiToSupplier);
}

function mapRequestToApi(request: CreateSupplierRequest | UpdateSupplierRequest) {
  const iban = request.iban?.replace(/\s/g, '').trim().toUpperCase();
  const apiRequest: Record<string, unknown> = {
    name: request.name,
    taxOffice: request.taxOffice,
    address: request.address,
    phone: request.phone,
    email: request.email,
    website: request.website || '',
    contactPerson: request.contactPerson,
    contactPhone: request.contactPhone,
    contactEmail: request.contactEmail,
    bankAccount: request.bankAccount,
    iban: iban || null,
    active: 'isActive' in request ? request.isActive : true,
    preferred: request.isPreferred,
    categoryIds: request.categoryIds || [],
  };
  if ('taxNumber' in request) {
    apiRequest.taxNumber = (request as CreateSupplierRequest).taxNumber;
  }
  return apiRequest;
}

class SupplierService {
  async getAllSuppliers(token: string): Promise<Supplier[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.BASE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error(`Tedarikçiler yüklenemedi (${response.status})`);
    return normalizeList(await response.json());
  }

  async getActiveSuppliers(token: string): Promise<Supplier[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.ACTIVE}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        const list = normalizeList(await response.json());
        if (list.length) return list;
      }
    } catch {
      // fallback
    }
    const all = await this.getAllSuppliers(token);
    return all.filter((s) => s.isActive !== false);
  }

  async getSupplierById(id: number, token: string): Promise<Supplier> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.BY_ID(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error(`Tedarikçi bulunamadı (${response.status})`);
    const data = await response.json();
    return mapApiToSupplier(data?.data ?? data);
  }

  async createSupplier(request: CreateSupplierRequest, token: string): Promise<Supplier> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(mapRequestToApi(request)),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Tedarikçi oluşturulamadı (${response.status})`);
    }
    return mapApiToSupplier(data?.data ?? data);
  }

  async updateSupplier(id: number, request: UpdateSupplierRequest, token: string): Promise<Supplier> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(mapRequestToApi(request)),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || `Tedarikçi güncellenemedi (${response.status})`);
    }
    return mapApiToSupplier(data?.data ?? data);
  }

  async deleteSupplier(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.BY_ID(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || `Tedarikçi silinemedi (${response.status})`);
    }
  }

  async getSuppliersByCategory(categoryId: number, token: string): Promise<Supplier[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.BY_CATEGORY(categoryId)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Kategori tedarikçileri yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }
}

export const supplierService = new SupplierService();
