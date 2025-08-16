import { User } from './user';

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
  quoteUid: string;
  quoteNumber: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  currency: string;
  deliveryDate: string;
  quoteDate: string;
  validityDate: string;
  notes: string;
  supplierReference: string;
  status: 'PENDING' | 'RESPONDED' | 'REJECTED' | 'CONVERTED_TO_ORDER';
  rejectionReason: string | null;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
  respondedAt: string;
  supplier: Supplier;
}

export interface PurchaseRequestItem {
  id: number;
  product: {
    id: number;
    name: string;
    code: string;
    description: string;
    category: string;
    unit: string;
  };
  potentialSuppliers: Supplier[];
  supplierQuotes: SupplierQuote[];
  selectedSupplierId: number | null;
  quantity: number;
  estimatedDeliveryDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: number;
  approver: User;
  roleName: string;
  stepOrder: number;
  status: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  actionTakenAt: string | null;
}

export interface PurchaseRequest {
  id: number;
  title: string;
  description: string;
  requester: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    title: string;
    manager: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    } | null;
  };
  status: string;
  approvals: Approval[];
  items: PurchaseRequestItem[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  rejectionReason: string | null;
  active: boolean;
  cancelled: boolean;
  completed: boolean;
  inApproval: boolean;
  inProgress: boolean;
  rejected: boolean;
  approved: boolean;
  pending: boolean;
}

export interface CreatePurchaseRequest {
  title: string;
  description: string;
}

export interface AddItemsRequest {
  items: PurchaseRequestItem[];
}

export interface ApprovalAction {
  comment: string;
}

export interface PurchaseRequestHistory {
  id: number;
  requestId: number;
  action: string;
  comment: string;
  actor: User;
  timestamp: string;
}

export interface PurchaseRequestResponse {
  success: boolean;
  message: string;
  data: PurchaseRequest | PurchaseRequest[];
  timestamp: string;
  errorCode?: string;
}

export interface UpdatePurchaseRequestItemsRequest {
  title: string;
  description: string;
  items: PurchaseRequestItem[];
}

export interface PurchaseRequestItemsResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    title: string;
    description: string;
    items: PurchaseRequestItem[];
  };
  timestamp: string;
} 