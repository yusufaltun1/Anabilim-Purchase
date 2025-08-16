import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';

export interface CompanyRegistrationData {
  companyName: string;
  industry: string;
  employeeCount: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  password: string;
  confirmPassword: string;
}

export interface CreditsInfo {
  hasEnoughCredits: boolean;
  currentCredits: number;
  requiredCredits: number;
  message: string;
}

export interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  currency: string;
  description: string;
  isPopular?: boolean;
  discount?: number;
}

export interface PurchaseRequest {
  packageId: number;
  paymentMethod: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  newCredits?: number;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    throw new Error('API Error');
  }
  return response.json();
}

export async function registerCompany(data: CompanyRegistrationData): Promise<any> {
  const response = await fetch('http://localhost:8091/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Kayıt işlemi başarısız');
  }
  
  return response.json();
}

export async function checkJobPositionCredits(): Promise<CreditsInfo> {
  const token = authService.getToken();
  const response = await fetch('http://localhost:8091/api/credits/check-job-position', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Kredi bilgileri alınamadı');
  }
  
  return response.json();
}

export async function getCreditPackages(): Promise<CreditPackage[]> {
  const token = authService.getToken();
  const response = await fetch('http://localhost:8091/api/credits/packages', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Kredi paketleri alınamadı');
  }
  
  return response.json();
}

export async function purchaseCredits(request: PurchaseRequest): Promise<PurchaseResponse> {
  const token = authService.getToken();
  const response = await fetch('http://localhost:8091/api/credits/purchase', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Kredi satın alma işlemi başarısız');
  }
  
  return response.json();
}

export async function fetchAllCandidates(): Promise<any[]> {
  const token = authService.getToken();
  const response = await fetch('http://localhost:8091/api/recruitment/candidates/all', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Adaylar alınamadı');
  }
  return response.json();
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith('/api') 
    ? `${API_CONFIG.BASE_URL}${endpoint}`
    : `${API_CONFIG.BASE_URL}/api${endpoint}`;
    
  const response = await fetch(url, {
    ...options,
    headers: {
      ...this.getHeaders(),
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error('API Error');
  }
  return response.json();
} 