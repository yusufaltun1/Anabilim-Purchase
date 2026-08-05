import type { PurchaseRequest } from '@/services/types/purchase.types';

/** Web Dashboard `isPurchasingStaff` ile aynı */
export function isPurchasingStaff(roles: string[] | null | undefined): boolean {
  const r = roles ?? [];
  return r.includes('SATIN_ALMA_DEPARTMANI') || r.includes('PURCHASE_MANAGER');
}

/** Web Dashboard istatistik + liste: IN_PROGRESS / APPROVED / PARTIAL_APPROVAL / PARTIALLY_APPROVED */
export function isDashboardInProgressStatus(status: string | undefined): boolean {
  if (!status) return false;
  return (
    status === 'IN_PROGRESS' ||
    status === 'APPROVED' ||
    status === 'PARTIAL_APPROVAL' ||
    status === 'PARTIALLY_APPROVED'
  );
}

export function countThisMonthRequests(requests: PurchaseRequest[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return requests.filter((request) => {
    const requestDate = new Date(request.createdAt || '');
    return requestDate >= startOfMonth;
  }).length;
}

export function countTodayRequests(requests: PurchaseRequest[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return requests.filter((request) => {
    const requestDate = new Date(request.createdAt || '');
    return requestDate >= today && requestDate < tomorrow;
  }).length;
}

export function countInProgressRequests(requests: PurchaseRequest[]): number {
  return requests.filter((r) => isDashboardInProgressStatus(r.status)).length;
}

export function sortByCreatedDesc(requests: PurchaseRequest[]): PurchaseRequest[] {
  return [...requests].sort(
    (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  );
}

export function filterInProgressRequests(requests: PurchaseRequest[]): PurchaseRequest[] {
  return sortByCreatedDesc(requests.filter((r) => isDashboardInProgressStatus(r.status)));
}

export function requesterLabel(request: PurchaseRequest): string {
  const r = request.requester;
  if (!r) return '';
  const name = `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
  return name || r.fullName || '';
}
