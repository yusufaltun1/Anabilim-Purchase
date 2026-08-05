import type { BadgeTone } from '@/components/ui';

/** Enum values are Turkish labels (API stores display strings). */
export enum PersonnelRole {
  PRINCIPAL = 'Müdür',
  VICE_PRINCIPAL = 'Müdür Yardımcısı',
  TEACHER = 'Öğretmen',
  GUIDANCE_COUNSELOR = 'Rehber Öğretmen',
  SECRETARY = 'Sekreter',
  ACCOUNTANT = 'Muhasebeci',
  SECURITY = 'Güvenlik',
  CLEANING = 'Temizlik',
  TECHNICAL = 'Teknik Personel',
  NURSE = 'Hemşire',
  LIBRARIAN = 'Kütüphaneci',
  IT_SUPPORT = 'BT Destek',
  OTHER = 'Diğer',
}

export enum PersonnelStatus {
  ACTIVE = 'Aktif',
  INACTIVE = 'Pasif',
  ON_LEAVE = 'İzinli',
  SUSPENDED = 'Uzaklaştırılmış',
  RETIRED = 'Emekli',
}

export enum EmploymentType {
  PERMANENT = 'Kadrolu',
  CONTRACT = 'Sözleşmeli',
  SUBSTITUTE = 'Vekil',
  HOURLY = 'Ücretli',
  VOLUNTEER = 'Gönüllü',
}

export const PERSONNEL_ROLE_OPTIONS = Object.values(PersonnelRole).map((value) => ({
  label: value,
  value,
}));

export const PERSONNEL_STATUS_OPTIONS = Object.values(PersonnelStatus).map((value) => ({
  label: value,
  value,
}));

export const EMPLOYMENT_TYPE_OPTIONS = Object.values(EmploymentType).map((value) => ({
  label: value,
  value,
}));

export const PERSONNEL_STATUS_TONE: Record<string, BadgeTone> = {
  [PersonnelStatus.ACTIVE]: 'success',
  [PersonnelStatus.INACTIVE]: 'neutral',
  [PersonnelStatus.ON_LEAVE]: 'warning',
  [PersonnelStatus.SUSPENDED]: 'error',
  [PersonnelStatus.RETIRED]: 'info',
};

export function getPersonnelStatusTone(status: string): BadgeTone {
  return PERSONNEL_STATUS_TONE[status] ?? 'neutral';
}

export type SchoolPersonnel = {
  id: number;
  schoolId: number;
  schoolName?: string;
  firstName: string;
  lastName: string;
  tcNo: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  employmentType: string;
  status: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  department?: string;
  branchSubject?: string;
  qualifications?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePersonnelRequest = {
  schoolId: number;
  firstName: string;
  lastName: string;
  tcNo: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  employmentType: string;
  status: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  department?: string;
  branchSubject?: string;
  qualifications?: string;
  notes?: string;
};

export type UpdatePersonnelRequest = {
  firstName: string;
  lastName: string;
  tcNo: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  employmentType: string;
  status: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  department?: string;
  branchSubject?: string;
  qualifications?: string;
  notes?: string;
  isActive: boolean;
};

export type PersonnelSearchParams = {
  query?: string;
  schoolId?: number;
  role?: string;
  employmentType?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type PaginatedPersonnelResponse = {
  content: SchoolPersonnel[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type PersonnelFormValues = {
  schoolId: number;
  schoolName?: string;
  firstName: string;
  lastName: string;
  tcNo: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  employmentType: string;
  status: string;
  startDate: string;
  endDate: string;
  salary: number | null;
  department: string;
  branchSubject: string;
  qualifications: string;
  notes: string;
  isActive: boolean;
};

function toIsoDateOnly(value: unknown): string {
  if (!value) return '';
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function mapApiToPersonnel(
  api: Record<string, unknown> | null | undefined
): SchoolPersonnel {
  if (!api) {
    return {
      id: 0,
      schoolId: 0,
      firstName: '',
      lastName: '',
      tcNo: '',
      email: '',
      phone: '',
      address: '',
      role: PersonnelRole.TEACHER,
      employmentType: EmploymentType.PERMANENT,
      status: PersonnelStatus.ACTIVE,
      startDate: '',
      isActive: true,
    };
  }
  return {
    id: Number(api.id) || 0,
    schoolId: Number(api.schoolId) || 0,
    schoolName: api.schoolName ? String(api.schoolName) : undefined,
    firstName: String(api.firstName ?? ''),
    lastName: String(api.lastName ?? ''),
    tcNo: String(api.tcNo ?? ''),
    email: String(api.email ?? ''),
    phone: String(api.phone ?? ''),
    address: String(api.address ?? ''),
    role: String(api.role ?? PersonnelRole.TEACHER),
    employmentType: String(api.employmentType ?? EmploymentType.PERMANENT),
    status: String(api.status ?? PersonnelStatus.ACTIVE),
    startDate: toIsoDateOnly(api.startDate),
    endDate: api.endDate ? toIsoDateOnly(api.endDate) : undefined,
    salary:
      api.salary === null || api.salary === undefined || api.salary === ''
        ? undefined
        : Number(api.salary),
    department: api.department ? String(api.department) : undefined,
    branchSubject: api.branchSubject ? String(api.branchSubject) : undefined,
    qualifications: api.qualifications ? String(api.qualifications) : undefined,
    notes: api.notes ? String(api.notes) : undefined,
    isActive: Boolean(api.isActive ?? api.active ?? true),
    createdAt: api.createdAt ? String(api.createdAt) : undefined,
    updatedAt: api.updatedAt ? String(api.updatedAt) : undefined,
  };
}

export function emptyPersonnelForm(): PersonnelFormValues {
  return {
    schoolId: 0,
    firstName: '',
    lastName: '',
    tcNo: '',
    email: '',
    phone: '',
    address: '',
    role: PersonnelRole.TEACHER,
    employmentType: EmploymentType.PERMANENT,
    status: PersonnelStatus.ACTIVE,
    startDate: toIsoDateOnly(new Date().toISOString()),
    endDate: '',
    salary: null,
    department: '',
    branchSubject: '',
    qualifications: '',
    notes: '',
    isActive: true,
  };
}

export function personnelToForm(person: SchoolPersonnel): PersonnelFormValues {
  return {
    schoolId: person.schoolId || 0,
    schoolName: person.schoolName,
    firstName: person.firstName || '',
    lastName: person.lastName || '',
    tcNo: person.tcNo || '',
    email: person.email || '',
    phone: person.phone || '',
    address: person.address || '',
    role: person.role || PersonnelRole.TEACHER,
    employmentType: person.employmentType || EmploymentType.PERMANENT,
    status: person.status || PersonnelStatus.ACTIVE,
    startDate: person.startDate || toIsoDateOnly(new Date().toISOString()),
    endDate: person.endDate || '',
    salary: person.salary ?? null,
    department: person.department || '',
    branchSubject: person.branchSubject || '',
    qualifications: person.qualifications || '',
    notes: person.notes || '',
    isActive: person.isActive ?? true,
  };
}

export function fullName(person: Pick<SchoolPersonnel, 'firstName' | 'lastName'>): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function validatePersonnelForm(
  form: PersonnelFormValues,
  mode: 'create' | 'edit'
): { ok: true } | { ok: false; message: string } {
  if (mode === 'create' && !form.schoolId) {
    return { ok: false, message: 'Okul seçimi zorunludur' };
  }
  if (!form.firstName.trim()) return { ok: false, message: 'Ad zorunludur' };
  if (!form.lastName.trim()) return { ok: false, message: 'Soyad zorunludur' };
  if (!form.tcNo.trim()) return { ok: false, message: 'TC Kimlik No zorunludur' };
  if (!/^\d{11}$/.test(form.tcNo.trim())) {
    return { ok: false, message: 'TC Kimlik No 11 haneli olmalıdır' };
  }
  if (!form.email.trim()) return { ok: false, message: 'E-posta zorunludur' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email.trim())) {
    return { ok: false, message: 'Geçerli bir e-posta adresi giriniz' };
  }
  if (!form.phone.trim()) return { ok: false, message: 'Telefon zorunludur' };
  const phoneRegex = /^[+]?[0-9\s\-()]+$/;
  if (!phoneRegex.test(form.phone.trim())) {
    return { ok: false, message: 'Geçerli bir telefon numarası giriniz' };
  }
  if (!form.address.trim()) return { ok: false, message: 'Adres zorunludur' };
  if (!form.role) return { ok: false, message: 'Görev zorunludur' };
  if (!form.employmentType) return { ok: false, message: 'İstihdam türü zorunludur' };
  if (!form.status) return { ok: false, message: 'Durum zorunludur' };
  if (!form.startDate) return { ok: false, message: 'İşe başlama tarihi zorunludur' };
  return { ok: true };
}

export function toCreatePersonnelRequest(form: PersonnelFormValues): CreatePersonnelRequest {
  return {
    schoolId: form.schoolId,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    tcNo: form.tcNo.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    role: form.role,
    employmentType: form.employmentType,
    status: form.status,
    startDate: form.startDate,
    endDate: form.endDate.trim() || undefined,
    salary: form.salary ?? undefined,
    department: form.department.trim() || undefined,
    branchSubject: form.branchSubject.trim() || undefined,
    qualifications: form.qualifications.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

export function toUpdatePersonnelRequest(form: PersonnelFormValues): UpdatePersonnelRequest {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    tcNo: form.tcNo.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    role: form.role,
    employmentType: form.employmentType,
    status: form.status,
    startDate: form.startDate,
    endDate: form.endDate.trim() || undefined,
    salary: form.salary ?? undefined,
    department: form.department.trim() || undefined,
    branchSubject: form.branchSubject.trim() || undefined,
    qualifications: form.qualifications.trim() || undefined,
    notes: form.notes.trim() || undefined,
    isActive: form.isActive,
  };
}
