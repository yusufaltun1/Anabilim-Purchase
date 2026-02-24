export interface Supplier {
  id: number;
  name: string;
  taxNumber: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
}

export interface SupplierQuote {
  id: number;
  quoteNumber?: string;
  unitPrice?: number;
  quantity?: number;
  totalPrice?: number;
  currency?: string;
  deliveryDate?: string;
  quoteDate?: string;
  validityDate?: string;
  notes?: string;
  supplierReference?: string;
  status?: string;
  isSelected?: boolean;
  supplier?: { id: number; name: string; contactPerson?: string; contactPhone?: string; contactEmail?: string };
}

export interface PurchaseRequestItem {
  id?: number;
  productName: string;
  description?: string;
  quantity: number;
  imageUrl?: string;
  imageBase64?: string;
  productLink?: string;
  potentialSupplierIds?: number[];
  potentialSuppliers?: Supplier[];
  supplierQuotes?: SupplierQuote[];
  selectedSupplierId?: number | null;
  estimatedDeliveryDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParentApproverCandidate {
  userId: number | null;
  userName: string;
  groupName: string;
}

export interface SendDownCandidate {
  userId: number;
  userName: string;
  label: string;
}

export interface CreatePurchaseRequestDto {
  title: string;
  description: string;
  items: Omit<PurchaseRequestItem, 'id' | 'potentialSuppliers' | 'supplierQuotes' | 'selectedSupplierId' | 'createdAt' | 'updatedAt'>[];
  firstApproverUserId?: number | null;
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
  nextApproverCandidates?: ParentApproverCandidate[];
  hasNoNextApprover?: boolean;
  sendDownCandidates?: SendDownCandidate[];
}

export interface CreatePurchaseRequestResponse {
  success: boolean;
  message: string;
  data: PurchaseRequest;
}
