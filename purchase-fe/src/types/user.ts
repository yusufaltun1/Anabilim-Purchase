export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  workLocation?: string;
  workLocationParentId?: number | null;
  workLocationChildId?: number | null;
  workLocationName?: string;
  schoolId?: number | null;
  schoolName?: string;
  userGroupNames?: string[];
  phone: string;
  roles: string[];
  isActive?: boolean;
  manager?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  microsoft365Id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  roles: string[];
  manager?: {
    id: number;
  };
}

export interface UpdateUserRequest {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  workLocation?: string;
  workLocationParentId?: number | null;
  workLocationChildId?: number | null;
  workLocationHierarchyTouched?: boolean;
  schoolId?: number | null;
  schoolTouched?: boolean;
  phone: string;
  roles: string[];
  manager?: {
    id: number;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User | User[];
  timestamp: string;
  errorCode: string | null;
} 