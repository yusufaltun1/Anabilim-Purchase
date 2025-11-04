export interface Supplier {
  id: number;
  name: string;
  taxNumber: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
}

export interface PurchaseRequestItem {
  id?: number;
  productName: string;
  description?: string;
  quantity: number;
  imageUrl?: string;
  productLink?: string;
  potentialSupplierIds?: number[];
  potentialSuppliers?: Supplier[];
  supplierQuotes?: any[];
  selectedSupplierId?: number;
  estimatedDeliveryDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseRequestDto {
  title: string;
  description: string;
  items: Omit<PurchaseRequestItem, 'id' | 'potentialSuppliers' | 'supplierQuotes' | 'selectedSupplierId' | 'createdAt' | 'updatedAt'>[];
}

export interface PurchaseRequest {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  requester: {
    id: number;
    fullName: string;
    email: string;
  };
  items: PurchaseRequestItem[];
  approvals: any[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  rejectionReason?: string;
}

export interface CreatePurchaseRequestResponse {
  success: boolean;
  message: string;
  data: PurchaseRequest;
}
