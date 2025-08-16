import { axiosInstance } from './axios-instance';
import { 
  School, 
  CreateSchoolRequest, 
  UpdateSchoolRequest, 
  SchoolSearchParams,
  PaginatedSchoolResponse,
  SchoolStatistics
} from '../types/school';

class SchoolService {
  // Create school
  async createSchool(data: CreateSchoolRequest): Promise<School> {
    const response = await axiosInstance.post('/api/schools', data);
    return response.data;
  }

  // Update school
  async updateSchool(id: number, data: UpdateSchoolRequest): Promise<School> {
    const response = await axiosInstance.put(`/api/schools/${id}`, data);
    return response.data;
  }

  // Delete school
  async deleteSchool(id: number): Promise<void> {
    await axiosInstance.delete(`/api/schools/${id}`);
  }

  // Get school by ID
  async getSchoolById(id: number): Promise<School> {
    const response = await axiosInstance.get(`/api/schools/${id}`);
    return response.data;
  }

  // Get school by code
  async getSchoolByCode(code: string): Promise<School> {
    const response = await axiosInstance.get(`/api/schools/code/${code}`);
    return response.data;
  }

  // Get all schools (paginated)
  async getAllSchools(params?: SchoolSearchParams): Promise<PaginatedSchoolResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const response = await axiosInstance.get(`/api/schools?${queryParams.toString()}`);
    return response.data;
  }

  // Get active schools
  async getActiveSchools(): Promise<School[]> {
    const response = await axiosInstance.get('/api/schools/active');
    return response.data;
  }

  // Search schools
  async searchSchools(params: SchoolSearchParams): Promise<PaginatedSchoolResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());

    const response = await axiosInstance.get(`/api/schools/search?${queryParams.toString()}`);
    return response.data;
  }

  // Get schools by city
  async getSchoolsByCity(city: string): Promise<School[]> {
    const response = await axiosInstance.get(`/api/schools/city/${encodeURIComponent(city)}`);
    return response.data;
  }

  // Get schools by district
  async getSchoolsByDistrict(district: string): Promise<School[]> {
    const response = await axiosInstance.get(`/api/schools/district/${encodeURIComponent(district)}`);
    return response.data;
  }

  // Get schools by type
  async getSchoolsByType(schoolType: string): Promise<School[]> {
    const response = await axiosInstance.get(`/api/schools/type/${encodeURIComponent(schoolType)}`);
    return response.data;
  }

  // Get active school count
  async getActiveSchoolCount(): Promise<number> {
    const response = await axiosInstance.get('/api/schools/statistics/count');
    return response.data;
  }

  // Get school count by city
  async getSchoolCountByCity(): Promise<Record<string, number>> {
    const response = await axiosInstance.get('/api/schools/statistics/by-city');
    return response.data;
  }
}

export const schoolService = new SchoolService(); 