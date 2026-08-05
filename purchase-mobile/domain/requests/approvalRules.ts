import type { PurchaseRequest, PurchaseRequestApproval, SendDownCandidate } from '@/services/types/purchase.types';
import type { UserInfo } from '@/services/types/auth.types';

const APPROVABLE_STATUSES = new Set([
  'IN_APPROVAL',
  'IN_PROGRESS',
  'PARTIAL_APPROVAL',
  'PARTIALLY_APPROVED',
]);

export function getCurrentApprover(
  request: PurchaseRequest | null | undefined
): PurchaseRequestApproval['approver'] | null {
  if (!request?.approvals?.length) return null;
  const pending = [...request.approvals]
    .filter((a) => a.status === 'PENDING')
    .sort((a, b) => a.stepOrder - b.stepOrder)[0];
  return pending?.approver ?? null;
}

export function getCurrentPendingApproval(
  request: PurchaseRequest | null | undefined
): PurchaseRequestApproval | null {
  if (!request?.approvals?.length) return null;
  return (
    [...request.approvals]
      .filter((a) => a.status === 'PENDING')
      .sort((a, b) => a.stepOrder - b.stepOrder)[0] ?? null
  );
}

export function canUserApprove(
  request: PurchaseRequest | null | undefined,
  userId: number | null | undefined
): boolean {
  if (!request || userId == null) return false;
  if (!APPROVABLE_STATUSES.has(request.status)) return false;
  const current = getCurrentApprover(request);
  return current?.id === userId;
}

export function isSerkanBeyApprover(user: UserInfo | null | undefined): boolean {
  return Boolean(user?.roles?.includes('SERKAN_BEY'));
}

export function canEditRequest(
  request: PurchaseRequest | null | undefined,
  canEditCapability: boolean
): boolean {
  if (!request || !canEditCapability) return false;
  return request.status !== 'CANCELLED' && request.status !== 'COMPLETED';
}

export function canDeleteRequest(
  request: PurchaseRequest | null | undefined,
  userId: number | null | undefined,
  canEditCapability: boolean
): boolean {
  if (!request || !canEditCapability || userId == null) return false;
  if (request.requester?.id !== userId) return false;
  return request.status !== 'CANCELLED' && request.status !== 'COMPLETED';
}

export type ReturnToCandidate = {
  userId: number;
  userName: string;
  label: string;
};

/** Web getReturnToCandidates parity: requester + önceki onaycılar + sendDown */
export function getReturnToCandidates(request: PurchaseRequest): ReturnToCandidate[] {
  const map = new Map<number, ReturnToCandidate>();

  if (request.requester?.id) {
    map.set(request.requester.id, {
      userId: request.requester.id,
      userName: request.requester.fullName || formatName(request.requester),
      label: 'Talep sahibi',
    });
  }

  for (const approval of request.approvals ?? []) {
    if (approval.status === 'APPROVED' && approval.approver?.id) {
      map.set(approval.approver.id, {
        userId: approval.approver.id,
        userName: formatName(approval.approver),
        label: approval.roleName || 'Önceki onaycı',
      });
    }
  }

  for (const c of request.sendDownCandidates ?? []) {
    map.set(c.userId, {
      userId: c.userId,
      userName: c.userName,
      label: c.label || 'İletilecek kişi',
    });
  }

  return Array.from(map.values());
}

function formatName(person: {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}): string {
  if (person.fullName?.trim()) return person.fullName.trim();
  const name = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
  return name || person.email || 'Kullanıcı';
}

export function toSendDownOptions(candidates: SendDownCandidate[] | undefined) {
  return (candidates ?? []).map((c) => ({
    value: String(c.userId),
    label: c.label ? `${c.userName} (${c.label})` : c.userName,
  }));
}
