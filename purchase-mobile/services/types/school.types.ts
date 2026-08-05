export enum SchoolType {
  ILKOKUL = 'PRIMARY_SCHOOL',
  ORTAOKUL = 'MIDDLE_SCHOOL',
  LISE = 'HIGH_SCHOOL',
  ANAOKULU = 'KINDERGARTEN',
  UNIVERSITE = 'UNIVERSITY',
  MESLEK_LISESI = 'VOCATIONAL_HIGH_SCHOOL',
  ANADOLU_LISESI = 'ANATOLIAN_HIGH_SCHOOL',
  FEN_LISESI = 'SCIENCE_HIGH_SCHOOL',
}

export const SCHOOL_TYPE_LABELS: Record<string, string> = {
  PRIMARY_SCHOOL: 'İlkokul',
  MIDDLE_SCHOOL: 'Ortaokul',
  HIGH_SCHOOL: 'Lise',
  KINDERGARTEN: 'Anaokulu',
  UNIVERSITY: 'Üniversite',
  VOCATIONAL_HIGH_SCHOOL: 'Meslek Lisesi',
  ANATOLIAN_HIGH_SCHOOL: 'Anadolu Lisesi',
  SCIENCE_HIGH_SCHOOL: 'Fen Lisesi',
};

export function getSchoolTypeLabel(schoolType: string): string {
  return SCHOOL_TYPE_LABELS[schoolType] ?? schoolType;
}

export const SCHOOL_TYPE_OPTIONS = Object.values(SchoolType).map((value) => ({
  label: getSchoolTypeLabel(value),
  value,
}));

export type School = {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  district: string;
  city: string;
  schoolType: string;
  studentCapacity: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSchoolRequest = {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  district: string;
  city: string;
  schoolType: string;
  studentCapacity: number;
  isActive?: boolean;
};

export type UpdateSchoolRequest = {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  district: string;
  city: string;
  schoolType: string;
  studentCapacity: number;
};

export type SchoolSearchParams = {
  query?: string;
  city?: string;
  district?: string;
  schoolType?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type PaginatedSchoolResponse = {
  content: School[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type SchoolFormValues = {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  district: string;
  city: string;
  schoolType: string;
  studentCapacity: number;
  isActive: boolean;
};

export function mapApiToSchool(api: Record<string, unknown> | null | undefined): School {
  if (!api) {
    return {
      id: 0,
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      principalName: '',
      district: '',
      city: '',
      schoolType: SchoolType.ILKOKUL,
      studentCapacity: 0,
      isActive: true,
    };
  }
  return {
    id: Number(api.id) || 0,
    name: String(api.name ?? ''),
    code: String(api.code ?? ''),
    address: String(api.address ?? ''),
    phone: String(api.phone ?? ''),
    email: String(api.email ?? ''),
    principalName: String(api.principalName ?? ''),
    district: String(api.district ?? ''),
    city: String(api.city ?? ''),
    schoolType: String(api.schoolType ?? SchoolType.ILKOKUL),
    studentCapacity: Number(api.studentCapacity) || 0,
    isActive: Boolean(api.isActive ?? api.active ?? true),
    createdAt: api.createdAt ? String(api.createdAt) : undefined,
    updatedAt: api.updatedAt ? String(api.updatedAt) : undefined,
  };
}

export function emptySchoolForm(): SchoolFormValues {
  return {
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
    district: '',
    city: '',
    schoolType: SchoolType.ILKOKUL,
    studentCapacity: 100,
    isActive: true,
  };
}

export function schoolToForm(school: School): SchoolFormValues {
  return {
    name: school.name || '',
    code: school.code || '',
    address: school.address || '',
    phone: school.phone || '',
    email: school.email || '',
    principalName: school.principalName || '',
    district: school.district || '',
    city: school.city || '',
    schoolType: school.schoolType || SchoolType.ILKOKUL,
    studentCapacity: school.studentCapacity || 100,
    isActive: school.isActive ?? true,
  };
}

export function generateSchoolCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-ZÇĞIİÖŞÜ0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 20);
}

export function validateSchoolForm(
  form: SchoolFormValues
): { ok: true } | { ok: false; message: string } {
  if (!form.name.trim()) return { ok: false, message: 'Okul adı zorunludur' };
  if (!form.code.trim()) return { ok: false, message: 'Okul kodu zorunludur' };
  if (!form.address.trim()) return { ok: false, message: 'Adres zorunludur' };
  if (!form.phone.trim()) return { ok: false, message: 'Telefon zorunludur' };
  if (!form.email.trim()) return { ok: false, message: 'E-posta zorunludur' };
  if (!form.principalName.trim()) return { ok: false, message: 'Müdür adı zorunludur' };
  if (!form.city.trim()) return { ok: false, message: 'Şehir zorunludur' };
  if (!form.district.trim()) return { ok: false, message: 'İlçe zorunludur' };
  if (!form.schoolType) return { ok: false, message: 'Okul türü zorunludur' };
  if (form.studentCapacity <= 0) {
    return { ok: false, message: "Öğrenci kapasitesi 0'dan büyük olmalıdır" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email.trim())) {
    return { ok: false, message: 'Geçerli bir e-posta adresi giriniz' };
  }
  const phoneRegex = /^[+]?[0-9\s\-()]+$/;
  if (!phoneRegex.test(form.phone.trim())) {
    return { ok: false, message: 'Geçerli bir telefon numarası giriniz' };
  }
  return { ok: true };
}
