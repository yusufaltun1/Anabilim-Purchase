interface QuoteProduct {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
}

interface QuoteSupplier {
  id: number;
  companyName: string;
  taxNumber: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
}

export interface SupplierQuote {
  id: number;
  quoteUid: string;
  requestItemId: number;
  product: QuoteProduct;
  supplier: QuoteSupplier;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  currency: string;
  deliveryDate: string;
  validityDate: string;
  notes: string;
  supplierReference: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
}

export interface UpdateSupplierQuoteRequest {
  unitPrice: number;
  quantity: number;
  currency: string;
  deliveryDate: string;
  validityDate: string;
  notes: string;
  supplierReference: string;
}

export interface SupplierQuoteResponse {
  success: boolean;
  message: string;
  data: SupplierQuote;
  timestamp: string;
} 