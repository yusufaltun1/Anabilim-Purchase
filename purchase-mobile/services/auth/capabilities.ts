import type { UserInfo } from '@/services/types/auth.types';

export type AppCapability =
  | 'REQUEST_CREATE'
  | 'REQUEST_EDIT'
  | 'REQUEST_VIEW'
  | 'REQUEST_APPROVE'
  | 'QUOTE_COLLECT'
  | 'COUNTER_OFFER'
  | 'ORDER_CREATE'
  | 'REQUEST_CLOSE'
  | 'SYSTEM_MANAGE'
  | 'INVENTORY_VIEW'
  | 'INVENTORY_MANAGE'
  | 'ACCOUNTING_VIEW';

/**
 * Web `authService.hasCapability` ile hizalı.
 * UI gizler; API yetkisi ayrı doğrulanır.
 */
export function hasCapability(
  user: UserInfo | null | undefined,
  capability: AppCapability,
  authenticated = true
): boolean {
  if (!authenticated || !user) return false;

  const roles = user.roles ?? [];
  const permissions = user.permissions ?? [];
  const hasRole = (allowed: string[]) => roles.some((r) => allowed.includes(r));

  if (capability === 'REQUEST_CREATE' || capability === 'REQUEST_VIEW') {
    return true;
  }

  switch (capability) {
    case 'REQUEST_EDIT':
      return permissions.includes('REQUEST_UPDATE') || permissions.includes('REQUEST_EDIT');
    case 'REQUEST_APPROVE':
      return (
        hasRole([
          'MUDUR',
          'MUDUR_YARDIMCISI',
          'IDARI_YONETIM_MUDURU',
          'SERKAN_BEY',
          'BOLUM_BASKANI',
          'KAMPUS_MUDURU',
          'SEDA_HANIM',
          'SATIN_ALMA_DEPARTMANI',
          'BILGI_ISLEM_DEPARTMANI',
          'SYSTEM_ADMIN',
          'MANAGER',
          'PURCHASE_MANAGER',
        ]) || permissions.includes('APPROVAL_APPROVE')
      );
    case 'COUNTER_OFFER':
      return hasRole(['SERKAN_BEY', 'BILGI_ISLEM_DEPARTMANI', 'SYSTEM_ADMIN']);
    case 'QUOTE_COLLECT':
    case 'ORDER_CREATE':
    case 'REQUEST_CLOSE':
      return hasRole([
        'SATIN_ALMA_DEPARTMANI',
        'BILGI_ISLEM_DEPARTMANI',
        'SYSTEM_ADMIN',
        'PURCHASE_MANAGER',
      ]);
    case 'SYSTEM_MANAGE':
      return hasRole(['BILGI_ISLEM_DEPARTMANI', 'SYSTEM_ADMIN']);
    case 'INVENTORY_VIEW':
      return (
        permissions.includes('INVENTORY_READ') ||
        permissions.includes('INVENTORY_UPDATE') ||
        hasRole([
          'SATIN_ALMA_DEPARTMANI',
          'BILGI_ISLEM_DEPARTMANI',
          'SYSTEM_ADMIN',
          'PURCHASE_MANAGER',
          'MANAGER',
        ])
      );
    case 'INVENTORY_MANAGE':
      return (
        permissions.includes('INVENTORY_UPDATE') ||
        hasRole([
          'SATIN_ALMA_DEPARTMANI',
          'BILGI_ISLEM_DEPARTMANI',
          'SYSTEM_ADMIN',
          'PURCHASE_MANAGER',
        ])
      );
    case 'ACCOUNTING_VIEW':
      return (
        permissions.includes('ACCOUNTING_READ') ||
        hasRole(['MUHASEBE', 'BILGI_ISLEM_DEPARTMANI', 'SYSTEM_ADMIN'])
      );
    default:
      return false;
  }
}

export type CapabilityFlags = {
  canCreateRequest: boolean;
  canViewRequest: boolean;
  canEditRequest: boolean;
  canApprove: boolean;
  canInventoryView: boolean;
  canInventoryManage: boolean;
  canSystemManage: boolean;
  canQuoteCollect: boolean;
  canEnterCounterOffer: boolean;
  canOrderCreate: boolean;
  canAccountingView: boolean;
  /** Transfer listesi: sistem yöneticisi VEYA kendisine atanmış transfer varsa UI’da göster */
  canSeeTransfers: (assignedCount: number) => boolean;
};

export function getCapabilityFlags(
  user: UserInfo | null | undefined,
  authenticated = true
): CapabilityFlags {
  const can = (c: AppCapability) => hasCapability(user, c, authenticated);
  const canSystemManage = can('SYSTEM_MANAGE');

  return {
    canCreateRequest: can('REQUEST_CREATE'),
    canViewRequest: can('REQUEST_VIEW'),
    canEditRequest: can('REQUEST_EDIT'),
    canApprove: can('REQUEST_APPROVE'),
    canInventoryView: can('INVENTORY_VIEW'),
    canInventoryManage: can('INVENTORY_MANAGE'),
    canSystemManage,
    canQuoteCollect: can('QUOTE_COLLECT'),
    canEnterCounterOffer: can('COUNTER_OFFER'),
    canOrderCreate: can('ORDER_CREATE'),
    canAccountingView: can('ACCOUNTING_VIEW'),
    canSeeTransfers: (assignedCount: number) => canSystemManage || assignedCount > 0,
  };
}
