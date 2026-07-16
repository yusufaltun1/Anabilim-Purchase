export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED'
}

export interface Assignment {
  id: number;
  stockItemId?: number;
  serialNumber?: string;
  productId: number;
  productName: string;
  productCode: string;
  assignedUserId?: number;
  assignedUserName?: string;
  assignedSchoolId?: number;
  assignedSchoolName?: string;
  assignedLocationId?: number;
  assignedLocationName?: string;
  locationName?: string;
  locationDetails?: string;
  assignmentDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: AssignmentStatus;
  quantity: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expired: boolean;
  userAssignment: boolean;
  locationAssignment: boolean;
  canBeReturned: boolean;
  canBeCancelled?: boolean;
  hasSignedForm?: boolean;
  signedFormFileName?: string;
  signedFormUploadedAt?: string;
  hasFormPhoto?: boolean;
  formPhotoUrl?: string;
  formPhotoFileName?: string;
  hasReturnPhoto?: boolean;
  returnPhotoUrl?: string;
  returnPhotoFileName?: string;
  hasReturnDocument?: boolean;
  returnDocumentFileName?: string;
  returnNotes?: string;
}

export interface ReturnAssignmentRequest {
  photo: File;
  document: File;
  notes?: string;
}

export interface CreateAssignmentRequest {
  productId: number;
  stockItemId?: number;
  warehouseId?: number;
  quantity?: number;
  assignedUserId?: number;
  assignedSchoolId?: number;
  assignedLocationId?: number;
  locationDetails?: string;
  expectedReturnDate?: string;
  notes?: string;
}

export interface AssignmentResponse {
  success: boolean;
  message: string;
  data: Assignment | Assignment[];
  timestamp: string;
}

export interface AssignmentCountResponse {
  success: boolean;
  message: string;
  data: number;
  timestamp: string;
}

export interface TransferRequest {
  newUserId?: number;
  newSchoolId?: number;
  newLocationName?: string;
  newLocationDetails?: string;
  notes?: string;
}
