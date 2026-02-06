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

export interface PurchaseRequestApproval {
  id: number;
  approver: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  roleName: string;
  stepOrder: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  createdAt: string;
  updatedAt: string;
  actionTakenAt?: string;
}

export interface PurchaseRequest {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'IN_APPROVAL';
  requester: {
    id: number;
    fullName: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  items: PurchaseRequestItem[];
  approvals: PurchaseRequestApproval[];
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
