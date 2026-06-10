export interface Location {
  id: number;
  name: string;
  description: string;
  parentId?: number | null;
  parentName?: string | null;
  level?: number;
  path?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocationRequest {
  name: string;
  description: string;
  parentId?: number | null;
}

export interface UpdateLocationRequest {
  name: string;
  description: string;
  parentId?: number | null;
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data: Location | Location[] | null;
  timestamp: string;
}
