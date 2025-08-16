export interface SupplierCategory {
  id: number;
  name: string;
  code: string;
}

export interface Supplier {
  id: number;
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
  categories: SupplierCategory[];
  isActive: boolean;
  isPreferred: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierRequest {
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
}

export interface UpdateSupplierRequest {
  name: string;
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
  isActive: boolean;
  isPreferred: boolean;
  categoryIds: number[];
}

export interface SupplierResponse {
  success: boolean;
  message: string;
  data: Supplier | Supplier[];
  timestamp: string;
} 