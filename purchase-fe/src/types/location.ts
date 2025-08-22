export interface Location {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocationRequest {
  name: string;
  description: string;
}

export interface UpdateLocationRequest {
  name: string;
  description: string;
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data: Location | Location[];
  timestamp: string;
}
