import { API_CONFIG } from '../config/api.config';
import { axiosInstance } from './axios-instance';
import { authService } from './auth.service';
import { 
  Assignment, 
  AssignmentResponse, 
  AssignmentCountResponse,
  CreateAssignmentRequest,
  TransferRequest,
  AssignmentStatus 
} from '../types/assignment';

class AssignmentService {
  private readonly baseUrl = '/api/v1/assignments';

  // CRUD İşlemleri
  async createAssignment(request: CreateAssignmentRequest): Promise<AssignmentResponse> {
    console.log('AssignmentService - createAssignment called with request:', request);
    console.log('AssignmentService - request type:', typeof request);
    console.log('AssignmentService - request keys:', Object.keys(request));
    console.log('AssignmentService - request details:', {
      productId: request.productId,
      stockItemId: request.stockItemId,
      quantity: request.quantity,
      assignedUserId: request.assignedUserId,
      assignedSchoolId: request.assignedSchoolId,
      assignedLocationId: request.assignedLocationId
    });
    
    try {
      const response = await axiosInstance.post<{ data?: Assignment } & Assignment>(this.baseUrl, request);
      console.log('AssignmentService - createAssignment success response:', response.data);
      const created = (response.data as { data?: Assignment }).data ?? (response.data as Assignment);
      return {
        success: true,
        message: 'Zimmet başarıyla oluşturuldu',
        data: created,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('AssignmentService - createAssignment error:', error);
      console.error('AssignmentService - error response data:', error.response?.data);
      console.error('AssignmentService - error status:', error.response?.status);
      console.error('AssignmentService - error message:', error.message);
      console.error('AssignmentService - full error object:', error);
      throw error;
    }
  }

  async getAssignmentById(id: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment>(`${this.baseUrl}/${id}`);
    return {
      success: true,
      message: 'Zimmet başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getAllAssignments(): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(this.baseUrl);
    return {
      success: true,
      message: 'Zimmetler başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async deleteAssignment(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async cancelAssignment(id: number): Promise<void> {
    try {
      await this.deleteAssignment(id);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        axiosError.response?.data?.message ??
        axiosError.message ??
        'Zimmet iptal edilirken bir hata oluştu';
      throw new Error(message);
    }
  }

  // Ürün Bazlı İşlemler
  async getAssignmentsByProduct(productId: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<AssignmentResponse>(`${this.baseUrl}/product/${productId}`);
    return response.data;
  }

  async getAssignmentsByStockItem(stockItemId: number): Promise<Assignment[]> {
    const response = await axiosInstance.get<{ success?: boolean; data?: Assignment[] }>(
      `${this.baseUrl}/stock-item/${stockItemId}`
    );
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && Array.isArray(body.data)) {
      return body.data;
    }
    return [];
  }

  async getAssignmentsByProductAndStatus(productId: number, status: AssignmentStatus): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/product/${productId}/status/${status}`);
    return {
      success: true,
      message: 'Ürün zimmetleri başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  // Kullanıcı Bazlı İşlemler
  async getAssignmentsByUser(userId: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/user/${userId}`);
    return {
      success: true,
      message: 'Kullanıcı zimmetleri başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getActiveAssignmentsByUser(userId: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/user/${userId}/active`);
    return {
      success: true,
      message: 'Kullanıcı aktif zimmetleri başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getAssignmentsByUserAndStatus(userId: number, status: AssignmentStatus): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/user/${userId}/status/${status}`);
    return {
      success: true,
      message: 'Kullanıcı zimmetleri başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  // Okul/Konum Bazlı İşlemler
  async getAssignmentsBySchool(schoolId: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/school/${schoolId}`);
    return {
      success: true,
      message: 'Okul zimmetleri başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getAssignmentsByLocation(locationName: string): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/location?locationName=${encodeURIComponent(locationName)}`);
    return {
      success: true,
      message: 'Konum zimmetleri başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getActiveAssignmentsByLocation(locationName: string): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/location/active?locationName=${encodeURIComponent(locationName)}`);
    return {
      success: true,
      message: 'Konum aktif zimmetleri başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  // Durum İşlemleri
  async getAssignmentsByStatus(status: AssignmentStatus): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/status/${status}`);
    return {
      success: true,
      message: 'Durum zimmetleri başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getActiveAssignments(): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/active`);
    return {
      success: true,
      message: 'Aktif zimmetler başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getExpiredAssignments(): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/expired`);
    return {
      success: true,
      message: 'Süresi dolmuş zimmetler başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  // Zimmet İşlemleri
  async returnAssignment(id: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.post<Assignment>(`${this.baseUrl}/${id}/return`);
    return {
      success: true,
      message: 'Zimmet başarıyla iade edildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async markAssignmentAsLost(id: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.post<Assignment>(`${this.baseUrl}/${id}/lost`);
    return {
      success: true,
      message: 'Zimmet kayıp olarak işaretlendi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async markAssignmentAsDamaged(id: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.post<Assignment>(`${this.baseUrl}/${id}/damaged`);
    return {
      success: true,
      message: 'Zimmet hasarlı olarak işaretlendi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async transferToUser(id: number, request: TransferRequest): Promise<AssignmentResponse> {
    const params = new URLSearchParams();
    if (request.newUserId) params.append('newUserId', request.newUserId.toString());
    if (request.newSchoolId) params.append('newSchoolId', request.newSchoolId.toString());
    if (request.notes) params.append('notes', request.notes);

    const response = await axiosInstance.post<Assignment>(`${this.baseUrl}/${id}/transfer/user?${params}`);
    return {
      success: true,
      message: 'Zimmet başarıyla transfer edildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async transferToLocation(id: number, request: TransferRequest): Promise<AssignmentResponse> {
    const params = new URLSearchParams();
    if (request.newLocationName) params.append('newLocationName', request.newLocationName);
    if (request.newLocationDetails) params.append('newLocationDetails', request.newLocationDetails);
    if (request.notes) params.append('notes', request.notes);

    const response = await axiosInstance.post<Assignment>(`${this.baseUrl}/${id}/transfer/location?${params}`);
    return {
      success: true,
      message: 'Zimmet başarıyla transfer edildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  // Sayım İşlemleri
  async getAssignmentCountByProduct(productId: number): Promise<AssignmentCountResponse> {
    const response = await axiosInstance.get<number>(`${this.baseUrl}/count/product/${productId}`);
    return {
      success: true,
      message: 'Ürün zimmet sayısı başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getAssignmentCountByUser(userId: number): Promise<AssignmentCountResponse> {
    const response = await axiosInstance.get<number>(`${this.baseUrl}/count/user/${userId}`);
    return {
      success: true,
      message: 'Kullanıcı zimmet sayısı başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getAssignmentCountBySchool(schoolId: number): Promise<AssignmentCountResponse> {
    const response = await axiosInstance.get<number>(`${this.baseUrl}/count/school/${schoolId}`);
    return {
      success: true,
      message: 'Okul zimmet sayısı başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getAssignmentCountByLocation(locationName: string): Promise<AssignmentCountResponse> {
    const response = await axiosInstance.get<number>(`${this.baseUrl}/count/location?locationName=${encodeURIComponent(locationName)}`);
    return {
      success: true,
      message: 'Konum zimmet sayısı başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getAssignmentCountByStatus(status: AssignmentStatus): Promise<AssignmentCountResponse> {
    const response = await axiosInstance.get<number>(`${this.baseUrl}/count/status/${status}`);
    return {
      success: true,
      message: 'Durum zimmet sayısı başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getActiveAssignmentCount(): Promise<AssignmentCountResponse> {
    const response = await axiosInstance.get<number>(`${this.baseUrl}/count/active`);
    return {
      success: true,
      message: 'Aktif zimmet sayısı başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  // Aktif/Pasif İşlemleri
  async getActiveOnlyAssignments(): Promise<AssignmentResponse> {
    const response = await axiosInstance.get<Assignment[]>(`${this.baseUrl}/active-only`);
    return {
      success: true,
      message: 'Sadece aktif zimmetler başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async activateAssignment(id: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.post<Assignment>(`${this.baseUrl}/${id}/activate`);
    return {
      success: true,
      message: 'Zimmet başarıyla aktif yapıldı',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async deactivateAssignment(id: number): Promise<AssignmentResponse> {
    const response = await axiosInstance.post<Assignment>(`${this.baseUrl}/${id}/deactivate`);
    return {
      success: true,
      message: 'Zimmet başarıyla pasif yapıldı',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private triggerBlobDownload(blob: Blob, fileName: string) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }

  async downloadAssignmentForm(assignmentId: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${this.baseUrl}/${assignmentId}/form/download`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message || 'Zimmet formu indirilemedi');
    }
    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `Zimmet_Formu_${assignmentId}.xlsx`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match) fileName = match[1].trim();
    }
    this.triggerBlobDownload(blob, fileName);
  }

  async uploadSignedAssignmentForm(assignmentId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_CONFIG.BASE_URL}${this.baseUrl}/${assignmentId}/form/signed`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message || 'İmzalı form yüklenemedi');
    }
  }

  async downloadSignedAssignmentForm(assignmentId: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${this.baseUrl}/${assignmentId}/form/signed`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message || 'İmzalı form indirilemedi');
    }
    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `imzali-zimmet-${assignmentId}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match) fileName = match[1].trim();
    }
    this.triggerBlobDownload(blob, fileName);
  }

  async uploadFormPhoto(assignmentId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_CONFIG.BASE_URL}${this.baseUrl}/${assignmentId}/form/photo`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message || 'Ürün fotoğrafı yüklenemedi');
    }
  }

  async fetchFormPhotoBlobUrl(assignmentId: number): Promise<string> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${this.baseUrl}/${assignmentId}/form/photo`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Fotoğraf yüklenemedi');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}

export const assignmentService = new AssignmentService();
