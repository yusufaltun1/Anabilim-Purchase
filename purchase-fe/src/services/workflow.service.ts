import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import { 
  ApprovalWorkflow, 
  WorkflowResponse, 
  CreateWorkflowRequest, 
  UpdateWorkflowRequest 
} from '../types/workflow';

class WorkflowService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllWorkflows(): Promise<ApprovalWorkflow[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/approval-workflows`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workflows');
    }

    const data: WorkflowResponse = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  }

  async getWorkflowById(id: number): Promise<ApprovalWorkflow> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/approval-workflows/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workflow');
    }

    const data: WorkflowResponse = await response.json();
    return data.data as ApprovalWorkflow;
  }

  async createWorkflow(workflow: CreateWorkflowRequest): Promise<ApprovalWorkflow> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/approval-workflows`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(workflow),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create workflow');
    }

    const data: WorkflowResponse = await response.json();
    return data.data as ApprovalWorkflow;
  }

  async updateWorkflow(id: number, workflow: UpdateWorkflowRequest): Promise<ApprovalWorkflow> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/approval-workflows/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(workflow),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update workflow');
    }

    const data: WorkflowResponse = await response.json();
    return data.data as ApprovalWorkflow;
  }

  async deleteWorkflow(id: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/approval-workflows/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete workflow');
    }
  }

  async getWorkflowsByCategory(category: string): Promise<ApprovalWorkflow[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/approval-workflows/category/${category}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workflows by category');
    }

    const data: WorkflowResponse = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  }

  async getActiveWorkflows(): Promise<ApprovalWorkflow[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/approval-workflows/active`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active workflows');
    }

    const data: WorkflowResponse = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  }
}

export const workflowService = new WorkflowService(); 