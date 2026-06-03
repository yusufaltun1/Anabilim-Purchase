import { StockItem, WarehouseStock, WarehouseStockInfo } from '../types/warehouse';

export function mapApiStockItem(dto: StockItem): StockItem {
  return {
    ...dto,
    isStockItemRecord: true,
    id: dto.id,
    warehouseId: dto.warehouseId ?? 0,
    warehouseName: dto.warehouseName ?? '',
    status: dto.status ?? 'IN_STOCK',
    serialNumber: dto.serialNumber ?? '',
    notes: dto.notes ?? null,
    assetConditionId: dto.assetConditionId,
    assetConditionName: dto.assetConditionName,
    allowsAssignment: dto.allowsAssignment,
    isAvailable: dto.isAvailable ?? (dto.status === 'IN_STOCK' && dto.allowsAssignment !== false),
    isAssigned: dto.status === 'ASSIGNED' || dto.status === 'IN_USE' || dto.isAssigned === true,
  };
}

export function warehouseStockToStockItem(stock: WarehouseStock, productId: number): StockItem {
  const qty = stock.currentStock ?? 0;
  return {
    isStockItemRecord: false,
    id: stock.id,
    productId: stock.productId ?? productId,
    productName: stock.product?.name ?? '',
    productCode: stock.product?.code ?? '',
    serialNumber: '',
    status: qty > 0 ? 'IN_STOCK' : 'ASSIGNED',
    warehouseId: stock.warehouse?.id ?? stock.warehouseId,
    warehouseName: stock.warehouse?.name ?? '',
    assignedUserId: null,
    assignedUserName: null,
    assignedSchoolId: null,
    assignedSchoolName: null,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString(),
    warrantyExpiryDate: new Date().toISOString(),
    locationDetails: '',
    imageUrl: null,
    additionalImages: [],
    notes: `Genel stok: ${qty} ${stock.product?.unit || 'adet'}`,
    isActive: true,
    createdAt: stock.createdAt ?? new Date().toISOString(),
    updatedAt: stock.updatedAt ?? new Date().toISOString(),
    isUnderWarranty: false,
    isAvailable: qty > 0,
    isAssigned: false,
    currentStock: qty,
  };
}

export function warehouseDetailToStockItem(stock: WarehouseStockInfo, productId: number, unit?: string): StockItem {
  const qty = stock.currentStock ?? 0;
  return {
    isStockItemRecord: false,
    id: stock.stockId,
    productId,
    productName: '',
    productCode: '',
    serialNumber: '',
    status: qty > 0 ? 'IN_STOCK' : 'ASSIGNED',
    warehouseId: stock.warehouse.id,
    warehouseName: stock.warehouse.name,
    assignedUserId: null,
    assignedUserName: null,
    assignedSchoolId: null,
    assignedSchoolName: null,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString(),
    warrantyExpiryDate: new Date().toISOString(),
    locationDetails: '',
    imageUrl: null,
    additionalImages: [],
    notes: `Genel stok: ${qty} ${unit || 'adet'}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isUnderWarranty: false,
    isAvailable: qty > 0,
    isAssigned: false,
    currentStock: qty,
  };
}

export function parseStockQuantityFromNotes(notes?: string | null): number {
  if (!notes) return 0;
  const match = notes.match(/Genel stok:\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}
