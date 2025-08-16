export enum SchoolType {
  ILKOKUL = 'İlkokul',
  ORTAOKUL = 'Ortaokul',
  LISE = 'Lise',
  ANAOKULU = 'Anaokulu',
  UNIVERSITE = 'Üniversite',
  MESLEK_LISESI = 'Meslek Lisesi',
  ANADOLU_LISESI = 'Anadolu Lisesi',
  FEN_LISESI = 'Fen Lisesi'
}

export interface School {
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
}

export interface CreateSchoolRequest {
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
}

export interface UpdateSchoolRequest {
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
}

export interface SchoolSearchParams {
  query?: string;
  city?: string;
  district?: string;
  schoolType?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface SchoolStatistics {
  totalCount: number;
  countByCity: Record<string, number>;
}

export interface PaginatedSchoolResponse {
  content: School[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface SchoolResponse {
  success: boolean;
  message: string;
  data: School | School[] | PaginatedSchoolResponse | SchoolStatistics;
  timestamp: string;
} 