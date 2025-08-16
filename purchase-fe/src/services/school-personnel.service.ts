import { axiosInstance } from './axios-instance';
import { 
  SchoolPersonnel, 
  CreatePersonnelRequest, 
  UpdatePersonnelRequest, 
  PersonnelSearchParams,
  PaginatedPersonnelResponse,
  PersonnelStatistics
} from '../types/school-personnel';

class SchoolPersonnelService {
  // Create personnel
  async createPersonnel(data: CreatePersonnelRequest): Promise<SchoolPersonnel> {
    const response = await axiosInstance.post('/api/school-personnel', data);
    return response.data;
  }

  // Update personnel
  async updatePersonnel(id: number, data: UpdatePersonnelRequest): Promise<SchoolPersonnel> {
    const response = await axiosInstance.put(`/api/school-personnel/${id}`, data);
    return response.data;
  }

  // Delete personnel
  async deletePersonnel(id: number): Promise<void> {
    await axiosInstance.delete(`/api/school-personnel/${id}`);
  }

  // Get personnel by ID
  async getPersonnelById(id: number): Promise<SchoolPersonnel> {
    const response = await axiosInstance.get(`/api/school-personnel/${id}`);
    return response.data;
  }

  // Get personnel by TC No
  async getPersonnelByTcNo(tcNo: string): Promise<SchoolPersonnel> {
    const response = await axiosInstance.get(`/api/school-personnel/tc/${tcNo}`);
    return response.data;
  }

  // Get all personnel (paginated)
  async getAllPersonnel(params?: PersonnelSearchParams): Promise<PaginatedPersonnelResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const response = await axiosInstance.get(`/api/school-personnel?${queryParams.toString()}`);
    return response.data;
  }

  // Get active personnel
  async getActivePersonnel(): Promise<SchoolPersonnel[]> {
    const response = await axiosInstance.get('/api/school-personnel/active');
    return response.data;
  }

  // Search personnel
  async searchPersonnel(params: PersonnelSearchParams): Promise<PaginatedPersonnelResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());

    const response = await axiosInstance.get(`/api/school-personnel/search?${queryParams.toString()}`);
    return response.data;
  }

  // Get personnel by school
  async getPersonnelBySchool(schoolId: number, params?: PersonnelSearchParams): Promise<PaginatedPersonnelResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const response = await axiosInstance.get(`/api/school-personnel/school/${schoolId}?${queryParams.toString()}`);
    return response.data;
  }

  // Get personnel by role
  async getPersonnelByRole(role: string): Promise<SchoolPersonnel[]> {
    const response = await axiosInstance.get(`/api/school-personnel/role/${encodeURIComponent(role)}`);
    return response.data;
  }

  // Get personnel by employment type
  async getPersonnelByEmploymentType(employmentType: string): Promise<SchoolPersonnel[]> {
    const response = await axiosInstance.get(`/api/school-personnel/employment-type/${encodeURIComponent(employmentType)}`);
    return response.data;
  }

  // Get personnel by status
  async getPersonnelByStatus(status: string): Promise<SchoolPersonnel[]> {
    const response = await axiosInstance.get(`/api/school-personnel/status/${encodeURIComponent(status)}`);
    return response.data;
  }

  // Get personnel statistics
  async getPersonnelStatistics(): Promise<PersonnelStatistics> {
    const response = await axiosInstance.get('/api/school-personnel/statistics');
    return response.data;
  }

  // Get personnel count by school
  async getPersonnelCountBySchool(): Promise<Record<string, number>> {
    const response = await axiosInstance.get('/api/school-personnel/statistics/by-school');
    return response.data;
  }

  // Get personnel count by role
  async getPersonnelCountByRole(): Promise<Record<string, number>> {
    const response = await axiosInstance.get('/api/school-personnel/statistics/by-role');
    return response.data;
  }

  // Update personnel status
  async updatePersonnelStatus(id: number, status: string): Promise<SchoolPersonnel> {
    const response = await axiosInstance.patch(`/api/school-personnel/${id}/status`, { status });
    return response.data;
  }

  // Transfer personnel to another school
  async transferPersonnel(id: number, newSchoolId: number): Promise<SchoolPersonnel> {
    const response = await axiosInstance.patch(`/api/school-personnel/${id}/transfer`, { schoolId: newSchoolId });
    return response.data;
  }
}

export const schoolPersonnelService = new SchoolPersonnelService(); 