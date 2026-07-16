import { CATEGORY_PRODUCT_TYPE_OPTIONS, CategoryProductType } from '../types/category';
import { resolveProductType } from './productType';

export type ManualStockMovementMode = 'quantity' | 'serial' | 'semi';

export interface ManualStockMovementConfig {
  mode: ManualStockMovementMode;
  label: string;
  description: string;
  /** Miktar alanı (sarf / yarı demirbaş) */
  showQuantity: boolean;
  /** Girişte kaç adet ekleneceği (demirbaş) */
  showInboundUnitCount: boolean;
  /** Girişte seri no listesi */
  showSerialListOnIn: boolean;
  /** Seri no zorunlu mu */
  serialRequired: boolean;
  /** Çıkışta depodaki cihaz seçimi */
  showStockItemPickerOnOut: boolean;
  /** Giriş/çıkış lokasyon seçimi (demirbaş) */
  showLocationPickers: boolean;
  /** Düzeltme hareketi */
  allowAdjustment: boolean;
}

const labelFor = (type: CategoryProductType) =>
  CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;

export function getManualStockMovementConfig(productType?: string | null): ManualStockMovementConfig {
  const resolved = resolveProductType(productType);

  if (resolved === 'FIXED_ASSET' || resolved === 'IT_HARDWARE') {
    return {
      mode: 'serial',
      label: labelFor(resolved),
      description:
        'Demirbaş girişinde her adet için seri numarası zorunludur. Giriş ve çıkışta lokasyon seçilir. Çıkışta depodaki hazır cihaz seçilir.',
      showQuantity: false,
      showInboundUnitCount: true,
      showSerialListOnIn: true,
      serialRequired: true,
      showStockItemPickerOnOut: true,
      showLocationPickers: true,
      allowAdjustment: false,
    };
  }

  if (resolved === 'SEMI_FIXED_ASSET') {
    return {
      mode: 'semi',
      label: labelFor('SEMI_FIXED_ASSET'),
      description:
        'Yarı demirbaşta miktar ile giriş/çıkış yapılır. Seri veya parti numarası opsiyoneldir.',
      showQuantity: true,
      showInboundUnitCount: false,
      showSerialListOnIn: true,
      serialRequired: false,
      showStockItemPickerOnOut: false,
      showLocationPickers: false,
      allowAdjustment: true,
    };
  }

  return {
    mode: 'quantity',
    label: resolved ? labelFor(resolved as CategoryProductType) : 'Sarf / miktar bazlı',
    description: 'Depo bazlı miktar ile giriş, çıkış veya düzeltme yapılır.',
    showQuantity: true,
    showInboundUnitCount: false,
    showSerialListOnIn: false,
    serialRequired: false,
    showStockItemPickerOnOut: false,
    showLocationPickers: false,
    allowAdjustment: true,
  };
}
