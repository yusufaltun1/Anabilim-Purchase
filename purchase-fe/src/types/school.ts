export enum SchoolType {
  ILKOKUL = 'PRIMARY_SCHOOL',
  ORTAOKUL = 'MIDDLE_SCHOOL',
  LISE = 'HIGH_SCHOOL',
  ANAOKULU = 'KINDERGARTEN',
  UNIVERSITE = 'UNIVERSITY',
  MESLEK_LISESI = 'VOCATIONAL_HIGH_SCHOOL',
  ANADOLU_LISESI = 'ANATOLIAN_HIGH_SCHOOL',
  FEN_LISESI = 'SCIENCE_HIGH_SCHOOL'
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
  isActive?: boolean;
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