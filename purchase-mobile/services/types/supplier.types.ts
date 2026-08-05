export type SupplierCategory = {
  id: number;
  name: string;
  code?: string;
};

export type Supplier = {
  id: number;
  name: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  bankAccount?: string;
  iban?: string;
  categories?: SupplierCategory[];
  isActive?: boolean;
  isPreferred?: boolean;
  /** API raw aliases */
  active?: boolean;
  preferred?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSupplierRequest = {
  name: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  bankAccount: string;
  iban?: string;
  categoryIds: number[];
  isPreferred: boolean;
  isActive?: boolean;
};

export type UpdateSupplierRequest = {
  name: string;
  taxOffice: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  bankAccount: string;
  iban?: string;
  isActive: boolean;
  isPreferred: boolean;
  categoryIds: number[];
};

export type SupplierFormValues = {
  name: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  bankAccount: string;
  iban: string;
  categoryIds: number[];
  isPreferred: boolean;
  isActive: boolean;
};

export function mapApiToSupplier(api: any): Supplier {
  if (!api) return api;
  return {
    ...api,
    isActive: api.isActive ?? api.active ?? true,
    isPreferred: api.isPreferred ?? api.preferred ?? false,
  };
}

export function emptySupplierForm(): SupplierFormValues {
  return {
    name: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    bankAccount: '',
    iban: '',
    categoryIds: [],
    isPreferred: false,
    isActive: true,
  };
}

export function supplierToForm(s: Supplier): SupplierFormValues {
  return {
    name: s.name || '',
    taxNumber: s.taxNumber || '',
    taxOffice: s.taxOffice || '',
    address: s.address || '',
    phone: s.phone || '',
    email: s.email || '',
    website: s.website || '',
    contactPerson: s.contactPerson || '',
    contactPhone: s.contactPhone || '',
    contactEmail: s.contactEmail || '',
    bankAccount: s.bankAccount || '',
    iban: s.iban || '',
    categoryIds: (s.categories ?? []).map((c) => c.id),
    isPreferred: Boolean(s.isPreferred ?? s.preferred),
    isActive: s.isActive ?? s.active ?? true,
  };
}

/** Web create parity */
export function validateSupplierForm(
  form: SupplierFormValues,
  mode: 'create' | 'edit'
): { ok: true } | { ok: false; message: string } {
  if (!form.name.trim()) return { ok: false, message: 'Firma adı gereklidir' };
  if (mode === 'create') {
    if (!/^\d{10}$/.test(form.taxNumber.trim())) {
      return { ok: false, message: 'Vergi numarası 10 haneli olmalıdır' };
    }
  }
  if (!form.taxOffice.trim()) return { ok: false, message: 'Vergi dairesi gereklidir' };
  if (!form.address.trim()) return { ok: false, message: 'Adres gereklidir' };
  if (!form.phone.trim()) return { ok: false, message: 'Telefon gereklidir' };
  if (!form.email.trim() || !form.email.includes('@')) {
    return { ok: false, message: 'Geçerli bir e-posta giriniz' };
  }
  if (!form.contactPerson.trim()) return { ok: false, message: 'İletişim kişisi gereklidir' };
  if (!/^\d{10,11}$/.test(form.contactPhone.replace(/\s/g, ''))) {
    return { ok: false, message: 'İletişim telefonu 10–11 hane olmalıdır' };
  }
  if (!form.contactEmail.trim() || !form.contactEmail.includes('@')) {
    return { ok: false, message: 'Geçerli bir iletişim e-postası giriniz' };
  }
  if (!form.bankAccount.trim()) return { ok: false, message: 'Banka hesabı gereklidir' };
  const iban = form.iban.replace(/\s/g, '').toUpperCase();
  if (iban && !/^TR\d{24}$/.test(iban)) {
    return { ok: false, message: 'IBAN TR ile başlamalı ve 26 karakter olmalıdır' };
  }
  return { ok: true };
}
