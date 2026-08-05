export type RequestItemDraft = {
  productName: string;
  description: string;
  quantity: number;
  productLink?: string;
  estimatedDeliveryDate: string;
  imageBase64?: string;
  notes?: string;
  potentialSupplierIds?: number[];
};

export type RequestFormDraft = {
  title: string;
  description: string;
  items: RequestItemDraft[];
  firstApproverUserId?: number | null;
};

export type ValidationResult = { ok: true } | { ok: false; message: string };

/** Web PurchaseRequestCreate parity */
export function validateRequestForm(
  form: RequestFormDraft,
  options?: { requireFirstApprover?: boolean }
): ValidationResult {
  if (!form.title.trim()) {
    return { ok: false, message: 'Talep başlığı gereklidir' };
  }
  if (!form.description.trim()) {
    return { ok: false, message: 'Açıklama gereklidir' };
  }
  if (form.items.length === 0) {
    return { ok: false, message: 'En az bir ürün eklemelisiniz' };
  }
  if (options?.requireFirstApprover && (form.firstApproverUserId == null || form.firstApproverUserId === undefined)) {
    return { ok: false, message: 'İlk onaycıyı seçmelisiniz' };
  }

  for (let i = 0; i < form.items.length; i++) {
    const item = form.items[i];
    const n = i + 1;
    if (!item.productName.trim()) {
      return { ok: false, message: `${n}. ürün için ürün adı gereklidir` };
    }
    if (!item.description.trim()) {
      return { ok: false, message: `${n}. ürün için açıklama gereklidir` };
    }
    if (!item.quantity || item.quantity < 1) {
      return { ok: false, message: `${n}. ürün için geçerli bir miktar giriniz` };
    }
    if (!item.estimatedDeliveryDate?.trim()) {
      return { ok: false, message: `${n}. ürün için tahmini teslimat tarihi gereklidir` };
    }
  }

  return { ok: true };
}
