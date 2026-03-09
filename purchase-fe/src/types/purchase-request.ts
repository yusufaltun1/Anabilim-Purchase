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
  /** Karşı teklif (ana tekliften bağımsız; tabloda "Karşı teklif var" gösterilir) */
  counterOfferUnitPrice?: number | null;
  counterOfferQuantity?: number | null;
  counterOfferEnteredAt?: string | null;
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
  // Yeni alanlar
  productId?: number;
  productName?: string;
  description?: string;
  imageBase64?: string;
  productLink?: string;
  potentialSupplierIds?: number[];
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

export interface PurchaseRequestAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize?: number;
  createdAt: string;
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
  /** Sadece bekleyen onaycı için; birden fazla üst grup varsa seçim listesi */
  nextApproverCandidates?: ParentApproverCandidate[];
  /** Üst onaycı yokken true; talebi alt kırılıma iletebilir veya tamamen onaylayabilir */
  hasNoNextApprover?: boolean;
  /** hasNoNextApprover true iken talebi iletebileceği kişiler */
  sendDownCandidates?: SendDownCandidate[];
  attachments?: PurchaseRequestAttachment[];
}

export interface CreatePurchaseRequestItem {
  productName: string;
  description: string;
  quantity: number;
  imageBase64?: string;
  productLink?: string;
  potentialSupplierIds: number[];
  estimatedDeliveryDate: string;
  notes?: string;
}

export interface CreatePurchaseRequest {
  title: string;
  description: string;
  items: CreatePurchaseRequestItem[];
  /** Birden fazla üst grup varsa, talebin gideceği ilk onaycı (userId). */
  firstApproverUserId?: number | null;
}

export interface AddItemsRequest {
  items: PurchaseRequestItem[];
}

export interface ApprovalAction {
  comment: string;
  /** Geri gönderilecek kişi (alt kırılım). Yoksa tamamen reddedilir. */
  returnToUserId?: number | null;
  /** Birden fazla üst grup varsa, onayı ileteceğin üst gruptaki kişi (userId). */
  nextApproverUserId?: number | null;
  /** Üst onaycı yokken talebi bu kullanıcıya ilet (alt kırılım). Yoksa tamamen onayla. */
  sendToUserId?: number | null;
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