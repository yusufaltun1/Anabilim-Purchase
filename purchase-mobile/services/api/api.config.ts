const defaultBaseUrl = __DEV__
  ? 'http://localhost:8080'
  : 'https://testsatinalmaapi.anabilim.k12.tr';
const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultBaseUrl;
const BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
    },
    PURCHASE: {
      BASE: '/api/purchase-requests',
      MY_REQUESTS: '/api/purchase-requests/my-requests',
      PENDING_APPROVALS: '/api/purchase-requests/pending-approvals',
      APPROVE: (id: number) => `/api/purchase-requests/${id}/approve`,
      REJECT: (id: number) => `/api/purchase-requests/${id}/reject`,
      DETAIL: (id: number) => `/api/purchase-requests/${id}`,
    },
    SUPPLIERS: {
      BASE: '/api/suppliers',
    },
  },
  TIMEOUT: 10000, // 10 saniye
};

export const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
 
  
  return headers;
};


export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};
