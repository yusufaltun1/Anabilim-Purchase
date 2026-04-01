export interface Permission {
  id?: number;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

