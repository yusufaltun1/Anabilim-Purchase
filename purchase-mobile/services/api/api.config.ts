const defaultBaseUrl = __DEV__
  ? 'https://testsatinalmaapi.anabilim.k12.tr'
  : 'https://testsatinalmaapi.anabilim.k12.tr';
const rawBaseUrl = defaultBaseUrl;
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
      SENIOR_FORWARDED_PENDING_APPROVALS:
        '/api/purchase-requests/pending-approvals/senior-forwarded',
      FIRST_APPROVER_CANDIDATES: '/api/purchase-requests/first-approver-candidates',
      APPROVE: (id: number) => `/api/purchase-requests/${id}/approve`,
      REJECT: (id: number) => `/api/purchase-requests/${id}/reject`,
      DETAIL: (id: number) => `/api/purchase-requests/${id}`,
      DELETE: (id: number) => `/api/purchase-requests/${id}`,
      UPDATE_ITEMS: (id: number) => `/api/purchase-requests/${id}/items`,
      ATTACHMENTS: (id: number) => `/api/purchase-requests/${id}/attachments`,
      ATTACHMENT_DOWNLOAD: (requestId: number, attachmentId: number) =>
        `/api/purchase-requests/${requestId}/attachments/${attachmentId}`,
    },
    SUPPLIERS: {
      BASE: '/api/suppliers',
      ACTIVE: '/api/suppliers/active',
      BY_ID: (id: number) => `/api/suppliers/${id}`,
      BY_CATEGORY: (categoryId: number) => `/api/suppliers/by-category/${categoryId}`,
    },
    PRODUCTS: {
      BASE: '/api/products',
      ACTIVE: '/api/products/active',
      BY_ID: (id: number) => `/api/products/${id}`,
      PROCUREMENT: (id: number) => `/api/products/${id}/procurement`,
      ADD_SUPPLIER: (productId: number, supplierId: number) =>
        `/api/products/${productId}/suppliers/${supplierId}`,
    },
    SUPPLIER_QUOTES: {
      BY_UID: (quoteUid: string) => `/api/supplier-quotes/${quoteUid}`,
      COUNTER_OFFER: (quoteUid: string) => `/api/supplier-quotes/${quoteUid}/counter-offer`,
    },
    PURCHASE_ORDERS: {
      BASE: '/api/v1/purchase-orders',
      BY_ID: (id: number) => `/api/v1/purchase-orders/${id}`,
      BY_STATUS: (status: string) => `/api/v1/purchase-orders/status/${status}`,
      UPDATE_STATUS: (id: number) => `/api/v1/purchase-orders/${id}/status`,
    },
    WAREHOUSES: {
      BASE: '/api/warehouses',
      ACTIVE: '/api/warehouses/active',
      STOCK_MOVEMENTS: '/api/warehouse-stocks/movements',
      STOCK_ITEMS: '/api/v1/stock-items',
      PRODUCT_STOCKS: '/api/warehouse-stocks/products',
      PRODUCT_STOCK_DETAIL: (productId: number) =>
        `/api/warehouse-stocks/product/${productId}/detail`,
    },
    SCHOOLS: {
      BASE: '/api/schools',
      ACTIVE: '/api/schools/active',
      SEARCH: '/api/schools/search',
      BY_ID: (id: number) => `/api/schools/${id}`,
      BY_CODE: (code: string) => `/api/schools/code/${encodeURIComponent(code)}`,
      BY_CITY: (city: string) => `/api/schools/city/${encodeURIComponent(city)}`,
      BY_DISTRICT: (district: string) => `/api/schools/district/${encodeURIComponent(district)}`,
      BY_TYPE: (schoolType: string) => `/api/schools/type/${encodeURIComponent(schoolType)}`,
    },
    PERSONNEL: {
      BASE: '/api/school-personnel',
      ACTIVE: '/api/school-personnel/active',
      SEARCH: '/api/school-personnel/search',
      BY_ID: (id: number) => `/api/school-personnel/${id}`,
      BY_SCHOOL: (schoolId: number) => `/api/school-personnel/school/${schoolId}`,
      BY_ROLE: (role: string) => `/api/school-personnel/role/${encodeURIComponent(role)}`,
      BY_STATUS: (status: string) => `/api/school-personnel/status/${encodeURIComponent(status)}`,
      BY_EMPLOYMENT_TYPE: (employmentType: string) =>
        `/api/school-personnel/employment-type/${encodeURIComponent(employmentType)}`,
    },
    LOCATIONS: {
      BASE: '/api/locations',
      BY_ID: (id: number) => `/api/locations/${id}`,
      PRODUCTS: (id: number) => `/api/locations/${id}/products`,
    },
    WORKFLOWS: {
      BASE: '/api/approval-workflows',
      ACTIVE: '/api/approval-workflows/active',
      BY_ID: (id: number) => `/api/approval-workflows/${id}`,
      BY_CATEGORY: (category: string) =>
        `/api/approval-workflows/category/${encodeURIComponent(category)}`,
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

/** Multipart için Content-Type eklenmez; fetch boundary otomatik ekler. */
export const getAuthHeadersMultipart = (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};
