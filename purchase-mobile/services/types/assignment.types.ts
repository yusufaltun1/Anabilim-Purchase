import { AssignmentStatus } from './product.types';

export type { Assignment, AssignmentStatus } from './product.types';

export type CreateAssignmentRequest = {
  productId: number;
  stockItemId?: number;
  warehouseId?: number;
  quantity?: number;
  assignedUserId?: number;
  assignedSchoolId?: number;
  assignedLocationId?: number;
  locationDetails?: string;
  expectedReturnDate?: string;
  notes?: string;
};

export type ReturnAssignmentPayload = {
  warehouseId: number;
  notes?: string;
  photoUri: string;
  photoName?: string;
  photoMimeType?: string;
  documentUri?: string;
  documentName?: string;
  documentMimeType?: string;
};

export type StockItemStatus = 'IN_STOCK' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED' | string;

export type StockItem = {
  id: number | string;
  productId: number;
  productName?: string;
  productCode?: string;
  serialNumber?: string;
  assetLabel?: string;
  status: StockItemStatus;
  warehouseId?: number | null;
  warehouseName?: string | null;
  assignedUserId?: number | null;
  assignedUserName?: string | null;
  imageUrl?: string | null;
  notes?: string | null;
  isActive?: boolean;
  isUnderWarranty?: boolean;
  currentStock?: number;
  isStockItemRecord?: boolean;
  assetConditionName?: string;
  allowsAssignment?: boolean;
  assignmentId?: number;
  assignmentStatus?: string;
};

export type StockMovementDetail = {
  id: number;
  quantity: number;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | string;
  referenceType?: string;
  referenceId?: number | null;
  notes?: string;
  stockItemId?: number;
  parentLocationId?: number;
  parentLocationName?: string;
  childLocationId?: number;
  childLocationName?: string;
  createdAt?: string;
};

export type ManualStockMovementPayload = {
  quantity: number;
  movementType: 'IN' | 'OUT';
  referenceType: 'MANUAL';
  referenceId?: number;
  notes?: string;
  stockItemId?: number;
  parentLocationId?: number;
  childLocationId?: number;
};

export function isAssignableStockRow(item: StockItem): boolean {
  if (item.isStockItemRecord === false) {
    const qty = item.currentStock ?? 0;
    return qty > 0 && Boolean(item.warehouseId);
  }
  return (
    item.status === 'IN_STOCK' &&
    Boolean(item.warehouseId) &&
    item.allowsAssignment === true
  );
}

/** Demirbaş / donanım — gerçek stock_items kaydı kullanılır */
export function usesSerialStockItems(value?: string | null): boolean {
  if (!value) return false;
  const t = value.trim().toUpperCase().replace(/\s+/g, '_');
  return t === 'FIXED_ASSET' || t === 'IT_HARDWARE' || t.includes('DEMIRBAS') || t.includes('DEMİRBAŞ');
}

export function canCancelAssignment(assignment: {
  status: AssignmentStatus | string;
  canBeCancelled?: boolean;
  hasSignedForm?: boolean;
}): boolean {
  if (typeof assignment.canBeCancelled === 'boolean') {
    return assignment.canBeCancelled;
  }
  return assignment.status === AssignmentStatus.ACTIVE && !assignment.hasSignedForm;
}

export function stockItemSerialLabel(item: StockItem): string {
  const parts = [item.serialNumber, item.assetLabel].filter(Boolean);
  return parts.length ? parts.join(' · ') : `Cihaz #${item.id}`;
}

export function stockItemStatusLabel(item: StockItem): string {
  return (
    item.assetConditionName ||
    (item.status === 'IN_STOCK' && 'Stokta') ||
    (item.status === 'ASSIGNED' && 'Zimmetli') ||
    (item.status === 'MAINTENANCE' && 'Bakımda') ||
    (item.status === 'RETIRED' && 'Emekli') ||
    String(item.status)
  );
}
