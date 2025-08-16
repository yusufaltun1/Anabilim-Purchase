import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import { 
  User, 
  UserResponse, 
  CreateUserRequest, 
  UpdateUserRequest 
} from '../types/user';

class UserService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data: UserResponse = await response.json();
    console.log('API Response:', data);
    return Array.isArray(data.data) ? data.data : [];
  }

  async getActiveUsers(): Promise<UserResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/active`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active users');
    }

    const data: UserResponse = await response.json();
    console.log('Active Users Response:', data);
    return data;
  }

  async getUserById(id: number): Promise<UserResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data: UserResponse = await response.json();
    return data;
  }

  async getUserByEmail(email: string): Promise<User> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/email/${email}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user by email');
    }

    const data = await response.json();
    return data;
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/department/${department}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users by department');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/role/${role}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users by role');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getUsersByManager(managerId: number): Promise<User[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/manager/${managerId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users by manager');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create user');
    }

    const data = await response.json();
    return data;
  }

  async updateUser(id: number, user: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update user');
    }

    const data = await response.json();
    return data;
  }

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete user');
    }
  }

  async addRoleToUser(userId: number, roleName: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/roles/${roleName}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add role to user');
    }
  }

  async removeRoleFromUser(userId: number, roleName: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/roles/${roleName}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to remove role from user');
    }
  }
}

export const userService = new UserService(); 