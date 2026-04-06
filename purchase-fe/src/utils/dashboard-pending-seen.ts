const storageKey = (userId: number) => `dashboard_pending_approval_seen_${userId}`;

export function getSeenPendingApprovalIds(userId: number): Set<number> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((n) => typeof n === 'number'));
  } catch {
    return new Set();
  }
}

export function markPendingApprovalSeen(userId: number, requestId: number): void {
  if (!userId || !requestId) return;
  const s = getSeenPendingApprovalIds(userId);
  s.add(requestId);
  localStorage.setItem(storageKey(userId), JSON.stringify([...s]));
}

/** Artık bekleyen listede olmayan id'leri temizler */
export function pruneSeenPendingApprovals(userId: number, currentPendingIds: number[]): void {
  const allowed = new Set(currentPendingIds);
  const s = getSeenPendingApprovalIds(userId);
  const next = [...s].filter((id) => allowed.has(id));
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
}
