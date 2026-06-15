/** Backend alan adı → formda gösterilecek Türkçe etiket */
export const PRODUCT_FIELD_LABELS: Record<string, string> = {
  name: 'Ürün adı',
  code: 'Ürün kodu',
  description: 'Açıklama',
  categoryId: 'Kategori',
  productType: 'Ürün tipi',
  unitOfMeasure: 'Birim',
  minQuantity: 'Minimum miktar',
  maxQuantity: 'Maksimum miktar',
  estimatedUnitPrice: 'Tahmini birim fiyat',
  currency: 'Para birimi',
  serialNumber: 'Seri no',
  serialnumber: 'Seri no',
  assetLabel: 'Demirbaş etiketi',
  domainName: 'Demirbaş adı',
  deviceModelId: 'Model',
  assetConditionId: 'Durum',
  defaultParentLocationId: 'Konum',
  defaultChildLocationId: 'Konum',
  schoolId: 'Şirket',
  orderNumber: 'Sipariş numarası',
  purchasePrice: 'Satın alma ücreti',
  warrantyMonths: 'Garanti',
  ipAddress: 'IP adresi',
  macAddress: 'MAC adresi',
};

export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
}

export function parseApiErrorResponse(data: unknown): ParsedApiError {
  const result: ParsedApiError = { message: 'İşlem başarısız', fieldErrors: {} };
  if (!data || typeof data !== 'object') return result;

  const body = data as Record<string, unknown>;
  if (typeof body.message === 'string' && body.message.trim()) {
    result.message = body.message;
  }

  const errors = body.errors;
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    for (const [field, msg] of Object.entries(errors as Record<string, unknown>)) {
      if (typeof msg === 'string') {
        result.fieldErrors[field] = msg;
      }
    }
  }

  return result;
}

export function formatFieldErrors(fieldErrors: Record<string, string>): string {
  return Object.entries(fieldErrors)
    .map(([field, msg]) => {
      const label = PRODUCT_FIELD_LABELS[field] || field;
      return `${label}: ${msg}`;
    })
    .join('\n');
}

export class ApiRequestError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.fieldErrors = fieldErrors;
  }
}
