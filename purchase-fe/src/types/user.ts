export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  roles: string[];
  isActive?: boolean;
  manager?: {
    id: number;
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
  microsoft365Id?: string;
}

export interface UpdateUserRequest {
  id: number;
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
  microsoft365Id?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User | User[];
  timestamp: string;
  errorCode: string | null;
} 