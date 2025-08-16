import { User } from './user';

export type PurchaseOrderStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  managerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  companyName: string;
  taxNumber: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
}

export interface SupplierQuote {
  id: number;
  quoteUid: string;
  requestItemId: number;
  product: Product | null;
  supplier: Supplier;
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
  respondedAt: string;
}

export interface PurchaseOrder {
  id: number;
  orderCode: string;
  supplierQuote: SupplierQuote | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: PurchaseOrderStatus;
  deliveryWarehouse: Warehouse | null;
  expectedDeliveryDate: string;
  actualDeliveryDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderRequest {
  supplierQuoteId: number;
  quantity: number;
  deliveryWarehouseId: number;
  expectedDeliveryDate: string;
  notes?: string;
}

export interface UpdatePurchaseOrderStatusRequest {
  status: PurchaseOrderStatus;
  comment?: string;
}

export interface PurchaseOrderResponse {
  success: boolean;
  message: string;
  data: PurchaseOrder | PurchaseOrder[];
  timestamp: string;
  errorCode?: string;
} 