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
  OTHER = 'Diğer'
}

export enum PersonnelStatus {
  ACTIVE = 'Aktif',
  INACTIVE = 'Pasif',
  ON_LEAVE = 'İzinli',
  SUSPENDED = 'Uzaklaştırılmış',
  RETIRED = 'Emekli'
}

export enum EmploymentType {
  PERMANENT = 'Kadrolu',
  CONTRACT = 'Sözleşmeli',
  SUBSTITUTE = 'Vekil',
  HOURLY = 'Ücretli',
  VOLUNTEER = 'Gönüllü'
}

export interface SchoolPersonnel {
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
  branchSubject?: string; // Öğretmenler için branş
  qualifications?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePersonnelRequest {
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
}

export interface UpdatePersonnelRequest {
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
}

export interface PersonnelSearchParams {
  query?: string;
  schoolId?: number;
  role?: string;
  employmentType?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PersonnelStatistics {
  totalCount: number;
  countByRole: Record<string, number>;
  countBySchool: Record<string, number>;
  countByStatus: Record<string, number>;
}

export interface PaginatedPersonnelResponse {
  content: SchoolPersonnel[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PersonnelResponse {
  success: boolean;
  message: string;
  data: SchoolPersonnel | SchoolPersonnel[] | PaginatedPersonnelResponse | PersonnelStatistics;
  timestamp: string;
} 