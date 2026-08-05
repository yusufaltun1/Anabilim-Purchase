import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = (userId: number) => `dashboard_pending_approval_seen_${userId}`;

export async function getSeenPendingApprovalIds(userId: number): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((n) => typeof n === 'number'));
  } catch {
    return new Set();
  }
}

export async function markPendingApprovalSeen(userId: number, requestId: number): Promise<void> {
  if (!userId || !requestId) return;
  const s = await getSeenPendingApprovalIds(userId);
  s.add(requestId);
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify([...s]));
}

/** Artık bekleyen listede olmayan id'leri temizler */
export async function pruneSeenPendingApprovals(
  userId: number,
  currentPendingIds: number[]
): Promise<void> {
  const allowed = new Set(currentPendingIds);
  const s = await getSeenPendingApprovalIds(userId);
  const next = [...s].filter((id) => allowed.has(id));
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
}
