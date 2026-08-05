import type {
  ApprovalWorkflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
} from '../types/workflow.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

function unwrapEntity(data: unknown): ApprovalWorkflow {
  if (data && typeof data === 'object' && 'data' in data && (data as { data: unknown }).data) {
    return (data as { data: ApprovalWorkflow }).data;
  }
  return data as ApprovalWorkflow;
}

function normalizeList(data: unknown): ApprovalWorkflow[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: ApprovalWorkflow[] }).data;
  }
  return [];
}

class WorkflowService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getAllWorkflows(token: string): Promise<ApprovalWorkflow[]> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.WORKFLOWS.BASE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Workflow'lar yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getActiveWorkflows(token: string): Promise<ApprovalWorkflow[]> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.WORKFLOWS.ACTIVE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Aktif workflow'lar yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getWorkflowById(id: number, token: string): Promise<ApprovalWorkflow> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.WORKFLOWS.BY_ID(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Workflow bulunamadı (${response.status})`
      );
    }
    const workflow = unwrapEntity(json);
    if (!workflow || typeof workflow !== 'object') {
      throw new Error('Geçersiz workflow verisi alındı');
    }
    return workflow;
  }

  async createWorkflow(
    workflow: CreateWorkflowRequest,
    token: string
  ): Promise<ApprovalWorkflow> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.WORKFLOWS.BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(workflow),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message ||
          `Workflow oluşturulamadı (${response.status})`
      );
    }
    const created = unwrapEntity(json);
    if (!created || typeof created !== 'object') {
      throw new Error('Geçersiz workflow verisi alındı');
    }
    return created;
  }

  async updateWorkflow(
    id: number,
    workflow: UpdateWorkflowRequest,
    token: string
  ): Promise<ApprovalWorkflow> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.WORKFLOWS.BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(workflow),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message ||
          `Workflow güncellenemedi (${response.status})`
      );
    }
    const updated = unwrapEntity(json);
    if (!updated || typeof updated !== 'object') {
      throw new Error('Geçersiz workflow verisi alındı');
    }
    return updated;
  }

  async deleteWorkflow(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.WORKFLOWS.BY_ID(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(
        (json as { message?: string })?.message || `Workflow silinemedi (${response.status})`
      );
    }
  }
}

export const workflowService = new WorkflowService();
