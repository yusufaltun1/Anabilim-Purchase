export type ApproverType = 'ROLE' | 'USER';
export type ApprovalType = 'APPROVE' | 'REJECT' | 'COMMENT';

export type WorkflowStep = {
  stepOrder: number;
  stepName: string;
  roleName: string;
  approverType: ApproverType;
  approvalType: ApprovalType;
  isRequired: boolean;
};

export type ApprovalWorkflow = {
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
};

export type CreateWorkflowRequest = {
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  category: string;
  steps: WorkflowStep[];
};

export type UpdateWorkflowRequest = CreateWorkflowRequest & {
  id: number;
  isActive?: boolean;
};

export type WorkflowFilter = 'all' | 'active' | 'inactive';

export type WorkflowFormValues = {
  name: string;
  description: string;
  minAmount: string;
  maxAmount: string;
  category: string;
  isActive: boolean;
};

export const WORKFLOW_CATEGORIES = [
  'IT_EQUIPMENT',
  'OFFICE_SUPPLIES',
  'MARKETING_MATERIALS',
  'TRAINING_SERVICES',
  'CONSULTING_SERVICES',
  'OTHER',
] as const;

export type WorkflowCategory = (typeof WORKFLOW_CATEGORIES)[number];

/** Edit ekranı sabit rol listesi (web ile aynı quirk — API değil) */
export const EDIT_WORKFLOW_ROLES = [
  'MANAGER',
  'PURCHASE_MANAGER',
  'SYSTEM_ADMIN',
  'FINANCE_MANAGER',
  'DEPARTMENT_HEAD',
  'GENERAL_MANAGER',
] as const;

export const APPROVAL_TYPE_OPTIONS: Array<{ value: ApprovalType; label: string }> = [
  { value: 'APPROVE', label: 'Onayla' },
  { value: 'REJECT', label: 'Reddet' },
  { value: 'COMMENT', label: 'Yorum Yap' },
];

export function formatCategoryLabel(category: string): string {
  return category.replace(/_/g, ' ');
}

export function formatWorkflowAmount(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

export function emptyWorkflowForm(): WorkflowFormValues {
  return {
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    category: '',
    isActive: true,
  };
}

export function emptyWorkflowStep(
  stepOrder: number,
  approverType: ApproverType = 'ROLE'
): WorkflowStep {
  return {
    stepOrder,
    stepName: '',
    roleName: '',
    approverType,
    approvalType: 'APPROVE',
    isRequired: true,
  };
}

export function categorySelectOptions() {
  return WORKFLOW_CATEGORIES.map((category) => ({
    label: formatCategoryLabel(category),
    value: category,
  }));
}

export function editRoleSelectOptions() {
  return EDIT_WORKFLOW_ROLES.map((role) => ({
    label: formatCategoryLabel(role),
    value: role,
  }));
}

export type WorkflowFormValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validateWorkflowForm(
  values: WorkflowFormValues,
  steps: WorkflowStep[],
  options: { requireStepName: boolean }
): WorkflowFormValidation {
  if (!values.name.trim()) {
    return { ok: false, message: 'Workflow adı gereklidir' };
  }
  if (!values.description.trim()) {
    return { ok: false, message: 'Açıklama gereklidir' };
  }
  if (!values.category) {
    return { ok: false, message: 'Kategori seçimi gereklidir' };
  }

  const minAmount = parseFloat(values.minAmount);
  const maxAmount = parseFloat(values.maxAmount);

  if (Number.isNaN(minAmount) || minAmount < 0) {
    return { ok: false, message: 'Geçerli minimum tutar giriniz' };
  }
  if (Number.isNaN(maxAmount) || maxAmount <= minAmount) {
    return { ok: false, message: 'Maksimum tutar minimum tutardan büyük olmalıdır' };
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (options.requireStepName && !step.stepName.trim()) {
      return { ok: false, message: `${i + 1}. adım için adım adı gereklidir` };
    }
    if (!step.roleName.trim()) {
      return { ok: false, message: `${i + 1}. adım için rol seçimi gereklidir` };
    }
  }

  return { ok: true };
}
