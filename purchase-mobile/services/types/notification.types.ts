export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  purchaseRequestId: number;
  createdAt: string; // ISO 8601 date string
}

export interface UnreadCountResponse {
  count: number;
}
