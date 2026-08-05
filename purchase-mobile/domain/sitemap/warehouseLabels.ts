import type { Warehouse } from '@/services/api/warehouse.service';

/** API `active` / `isActive` alanlarını tek booleana indirger. */
export function isWarehouseActive(
  warehouse: Pick<Warehouse, 'active' | 'isActive'> | null | undefined
): boolean {
  if (!warehouse) return true;
  return warehouse.isActive ?? warehouse.active ?? true;
}

export function getWarehouseStatusLabel(active: boolean): string {
  return active ? 'Aktif' : 'Pasif';
}

export function getStockMovementTypeLabel(type?: string | null): string {
  switch (type) {
    case 'IN':
      return 'Giriş';
    case 'OUT':
      return 'Çıkış';
    case 'ADJUSTMENT':
      return 'Düzeltme';
    case 'TRANSFER':
      return 'Transfer';
    default:
      return type?.trim() ? type : '—';
  }
}

export function formatWarehouseDate(dateString?: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatWarehouseDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
