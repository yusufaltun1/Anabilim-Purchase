export interface WorkflowStep {
  stepOrder: number;
  stepName: string;
  roleName: string;
  approverType: 'ROLE'|"USER";
  approvalType: 'APPROVE' | 'REJECT' | 'COMMENT';
  isRequired: boolean;
}

export interface ApprovalWorkflow {
  id?: number;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  category: string;
  steps: WorkflowStep[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowResponse {
  success: boolean;
  message: string;
  data: ApprovalWorkflow | ApprovalWorkflow[];
  timestamp: string;
  errorCode: string | null;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  category: string;
  steps: WorkflowStep[];
  isActive?: boolean;
}

export interface UpdateWorkflowRequest extends CreateWorkflowRequest {
  id: number;
} 