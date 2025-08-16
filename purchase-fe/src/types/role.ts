export interface Role {
  id?: number;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
}

export interface RoleResponse {
  success: boolean;
  message: string;
  data: Role | Role[];
  timestamp: string;
  errorCode: string | null;
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  id: number;
}

export interface Permission {
  name: string;
  displayName: string;
  description: string;
  category: string;
} 