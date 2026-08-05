import type { CapabilityFlags } from '@/services/auth/capabilities';
import type { Ionicons } from '@expo/vector-icons';

export type HomeCounts = {
  myTotal: number;
  myOpen: number;
  myApproved: number;
  myRejected: number;
  /** Onay bekleyen (satın alma personelinde senior-forwarded hariç) */
  pendingApprovals: number;
  transferCount: number;
  /** getMyRequests üzerinden Dashboard istatistikleri */
  thisMonth: number;
  today: number;
  inProgress: number;
};

export const EMPTY_HOME_COUNTS: HomeCounts = {
  myTotal: 0,
  myOpen: 0,
  myApproved: 0,
  myRejected: 0,
  pendingApprovals: 0,
  transferCount: 0,
  thisMonth: 0,
  today: 0,
  inProgress: 0,
};

export type HomeRoute =
  | '/create-request'
  | '/(tabs)/my-requests'
  | '/(tabs)/pending-approvals'
  | '/product-search'
  | '/create-product'
  | '/products'
  | '/products/create'
  | '/products/edit/[id]'
  | '/stock-management'
  | '/stock-management/[id]'
  | '/categories'
  | '/categories/create'
  | '/suppliers'
  | '/warehouses'
  | '/warehouses/create'
  | '/warehouses/[id]'
  | '/schools'
  | '/schools/create'
  | '/schools/edit/[id]'
  | '/schools/[id]'
  | '/personnel'
  | '/personnel/create'
  | '/personnel/[id]'
  | '/personnel/edit/[id]'
  | '/users'
  | '/users/create'
  | '/users/edit/[id]'
  | '/roles'
  | '/roles/create'
  | '/roles/edit/[id]'
  | '/workflows'
  | '/workflows/create'
  | '/workflows/edit/[id]'
  | '/permissions'
  | '/locations'
  | '/locations/create'
  | '/locations/edit/[id]'
  | '/locations/[id]'
  | '/transfers'
  | '/transfers/create'
  | '/transfers/[id]'
  | '/purchase-orders'
  | '/accounting'
  | '/ui-kit'
  | '/(tabs)/more'
  | '/(tabs)/notifications';

export type PrimaryCta = {
  title: string;
  route: HomeRoute;
  icon: keyof typeof Ionicons.glyphMap;
};

export type AttentionChip = {
  key: string;
  label: string;
  route: HomeRoute;
};

export type MetricItem = {
  key: string;
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'error';
};

export type QuickAction = {
  key: string;
  title: string;
  description: string;
  route: HomeRoute;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
};

export type MoreMenuItem = {
  key: string;
  title: string;
  subtitle?: string;
  route: HomeRoute;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
};

export function getPrimaryCta(caps: CapabilityFlags, counts: HomeCounts): PrimaryCta {
  if (caps.canApprove && counts.pendingApprovals > 0) {
    return {
      title: `Onayları incele (${counts.pendingApprovals})`,
      route: '/(tabs)/pending-approvals',
      icon: 'checkmark-circle',
    };
  }
  if (caps.canSeeTransfers(counts.transferCount) && counts.transferCount > 0) {
    return {
      title: `Transferleri gör (${counts.transferCount})`,
      route: '/transfers',
      icon: 'swap-horizontal',
    };
  }
  return {
    title: 'Yeni talep oluştur',
    route: '/create-request',
    icon: 'add-circle',
  };
}

export function getAttentionChips(caps: CapabilityFlags, counts: HomeCounts): AttentionChip[] {
  const chips: AttentionChip[] = [];
  if (caps.canApprove && counts.pendingApprovals > 0) {
    chips.push({
      key: 'approvals',
      label: `${counts.pendingApprovals} onay`,
      route: '/(tabs)/pending-approvals',
    });
  }
  if (caps.canSeeTransfers(counts.transferCount) && counts.transferCount > 0) {
    chips.push({
      key: 'transfers',
      label: `${counts.transferCount} transfer`,
      route: '/transfers',
    });
  }
  return chips;
}

/** Web Dashboard istatistik kartları — Home üzerinde 2×2 */
export function getHomeMetrics(_caps: CapabilityFlags, counts: HomeCounts): MetricItem[] {
  return [
    {
      key: 'thisMonth',
      label: 'Bu Ay Talepler',
      value: counts.thisMonth,
      icon: 'calendar',
      tone: 'primary',
    },
    {
      key: 'today',
      label: 'Bugün Talepler',
      value: counts.today,
      icon: 'time',
      tone: 'info',
    },
    {
      key: 'pending',
      label: 'Onay Bekleyen',
      value: counts.pendingApprovals,
      icon: 'alert-circle',
      tone: 'warning',
    },
    {
      key: 'inProgress',
      label: 'İşlemde',
      value: counts.inProgress,
      icon: 'flash',
      tone: 'success',
    },
  ];
}

export function getQuickActions(caps: CapabilityFlags, counts: HomeCounts): QuickAction[] {
  const actions: QuickAction[] = [
    {
      key: 'new-request',
      title: 'Yeni talep',
      description: 'Satın alma talebi',
      route: '/create-request',
      icon: 'add-circle',
    },
    {
      key: 'my-requests',
      title: 'Taleplerim',
      description: 'Taleplerinizi görün',
      route: '/(tabs)/my-requests',
      icon: 'document-text',
    },
  ];

  if (caps.canApprove) {
    actions.push({
      key: 'approvals',
      title: 'Onaylar',
      description: 'Sizden bekleyenler',
      route: '/(tabs)/pending-approvals',
      icon: 'checkmark-circle',
      badge: counts.pendingApprovals > 0 ? counts.pendingApprovals : undefined,
    });
  }

  if (caps.canInventoryView) {
    actions.push({
      key: 'product-search',
      title: 'Ürün ara',
      description: 'Ad veya kod ile',
      route: '/product-search',
      icon: 'search',
    });
  }

  if (caps.canInventoryManage) {
    actions.push({
      key: 'create-product',
      title: 'Ürün oluştur',
      description: 'Yeni ürün ekle',
      route: '/products/create',
      icon: 'cube',
    });
  }

  if (caps.canSeeTransfers(counts.transferCount)) {
    actions.push({
      key: 'transfers',
      title: 'Transferler',
      description: 'Teslim / liste',
      route: '/transfers',
      icon: 'swap-horizontal',
      badge: counts.transferCount > 0 ? counts.transferCount : undefined,
    });
  }

  if (caps.canOrderCreate) {
    actions.push({
      key: 'purchase-orders',
      title: 'Siparişler',
      description: 'Satın alma siparişleri',
      route: '/purchase-orders',
      icon: 'cart',
    });
  }

  if (caps.canAccountingView) {
    actions.push({
      key: 'accounting',
      title: 'Muhasebe',
      description: 'Sipariş özeti',
      route: '/accounting',
      icon: 'calculator',
    });
  }

  return actions;
}

export function getMoreMenuItems(
  caps: CapabilityFlags,
  counts: HomeCounts,
  options?: { includeDev?: boolean }
): MoreMenuItem[] {
  const items: MoreMenuItem[] = [];

  if (caps.canInventoryView) {
    items.push({
      key: 'product-search',
      title: 'Ürün ara',
      subtitle: 'Ad, kod veya barkod',
      route: '/product-search',
      icon: 'search',
    });
    items.push({
      key: 'products',
      title: 'Ürünler',
      subtitle: 'Ürün kataloğu',
      route: '/products',
      icon: 'cube-outline',
    });
    items.push({
      key: 'stock-management',
      title: 'Stok yönetimi',
      subtitle: 'Ürün bazlı stok özeti',
      route: '/stock-management',
      icon: 'layers-outline',
    });
    items.push({
      key: 'categories',
      title: 'Kategoriler',
      subtitle: 'Stok odası kategorileri',
      route: '/categories',
      icon: 'folder-outline',
    });
    items.push({
      key: 'locations',
      title: 'Konumlar',
      subtitle: 'Site haritası / konum hiyerarşisi',
      route: '/locations',
      icon: 'location-outline',
    });
  }

  if (caps.canInventoryManage) {
    items.push({
      key: 'create-product',
      title: 'Ürün oluştur',
      subtitle: 'Yeni ürün kaydı',
      route: '/products/create',
      icon: 'cube',
    });
  }

  if (caps.canSystemManage) {
    items.push({
      key: 'suppliers',
      title: 'Tedarikçiler',
      subtitle: 'Firma ve iletişim kayıtları',
      route: '/suppliers',
      icon: 'business',
    });
    items.push({
      key: 'schools',
      title: 'Okullar',
      subtitle: 'Okul kayıtları ve iletişim',
      route: '/schools',
      icon: 'school-outline',
    });
    items.push({
      key: 'personnel',
      title: 'Personel',
      subtitle: 'Okul personeli yönetimi',
      route: '/personnel',
      icon: 'people',
    });
    items.push({
      key: 'users',
      title: 'Kullanıcılar',
      subtitle: 'Kullanıcı ve rol yönetimi',
      route: '/users',
      icon: 'people-outline',
    });
    items.push({
      key: 'roles',
      title: 'Roller',
      subtitle: 'Rol ve izin atamaları',
      route: '/roles',
      icon: 'shield-outline',
    });
    items.push({
      key: 'workflows',
      title: 'İş Akışları',
      subtitle: 'Onay süreçleri yönetimi',
      route: '/workflows',
      icon: 'git-branch-outline',
    });
    items.push({
      key: 'permissions',
      title: 'Permissionlar',
      subtitle: 'Permission tanımları',
      route: '/permissions',
      icon: 'key-outline',
    });
  }

  if (caps.canSystemManage || caps.canQuoteCollect || caps.canInventoryView) {
    items.push({
      key: 'warehouses',
      title: 'Depolar',
      subtitle: 'Depo listesi ve stoklar',
      route: '/warehouses',
      icon: 'storefront-outline',
    });
  }

  if (caps.canSeeTransfers(counts.transferCount)) {
    items.push({
      key: 'transfers',
      title: 'Transferler',
      subtitle: 'Atanan / yönetilen transferler',
      route: '/transfers',
      icon: 'swap-horizontal',
      badge: counts.transferCount > 0 ? counts.transferCount : undefined,
    });
  }

  if (caps.canOrderCreate) {
    items.push({
      key: 'purchase-orders',
      title: 'Siparişler',
      subtitle: 'Satın alma siparişleri',
      route: '/purchase-orders',
      icon: 'cart',
    });
  }

  if (caps.canAccountingView) {
    items.push({
      key: 'accounting',
      title: 'Muhasebe',
      subtitle: 'Sipariş finansal özeti',
      route: '/accounting',
      icon: 'calculator',
    });
  }

  if (caps.canApprove) {
    items.push({
      key: 'approvals',
      title: 'Onay bekleyenler',
      subtitle: 'Onay kutusu',
      route: '/(tabs)/pending-approvals',
      icon: 'checkmark-circle',
      badge: counts.pendingApprovals > 0 ? counts.pendingApprovals : undefined,
    });
  }

  items.push({
    key: 'my-requests',
    title: 'Taleplerim',
    subtitle: 'Oluşturduğunuz talepler',
    route: '/(tabs)/my-requests',
    icon: 'document-text',
  });

  items.push({
    key: 'create-request',
    title: 'Yeni talep',
    subtitle: 'Satın alma talebi oluştur',
    route: '/create-request',
    icon: 'add-circle',
  });

  if (options?.includeDev) {
    items.push({
      key: 'ui-kit',
      title: 'UI Kit',
      subtitle: 'Geliştirici katalog',
      route: '/ui-kit',
      icon: 'color-palette-outline',
    });
  }

  return items;
}

export { isOpenRequestStatus } from '@/domain/requests/requestStatus';
