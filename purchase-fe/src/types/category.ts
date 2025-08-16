export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  code?: string;
  parentId?: number | null;
  subCategories?: Category[];
  productCount?: number;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  code?: string;
  parentId?: number;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
  code?: string;
  parentId?: number;
  isActive: boolean;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category | Category[] | null;
  timestamp: string;
} 