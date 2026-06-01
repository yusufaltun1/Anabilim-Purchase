import type { Permission } from '../types/permission';

/** UI işlem kutularından role yazılacak ham permission adları */
export const OPERATION_PERMISSION_MAP: Record<string, string[]> = {
  REQUEST_CREATE: ['REQUEST_CREATE'],
  REQUEST_EDIT: ['REQUEST_UPDATE'],
  REQUEST_VIEW: ['REQUEST_READ'],
  REQUEST_APPROVE: ['APPROVAL_APPROVE', 'APPROVAL_REJECT', 'APPROVAL_RETURN'],
  QUOTE_COLLECT: ['INVENTORY_READ'],
  ORDER_CREATE: ['INVENTORY_UPDATE'],
  REQUEST_CLOSE: ['REQUEST_DELETE'],
  SYSTEM_MANAGE: ['WORKFLOW_CREATE', 'WORKFLOW_READ', 'WORKFLOW_UPDATE', 'WORKFLOW_DELETE'],
  INVENTORY_VIEW: ['INVENTORY_READ'],
  INVENTORY_MANAGE: ['INVENTORY_UPDATE'],
};

export const OPERATION_LABELS: Array<{ key: string; label: string }> = [
  { key: 'REQUEST_CREATE', label: 'Talep Açma' },
  { key: 'REQUEST_EDIT', label: 'Talep Düzenleme' },
  { key: 'REQUEST_VIEW', label: 'Talep Görüntüleme' },
  { key: 'REQUEST_APPROVE', label: 'Onay' },
  { key: 'QUOTE_COLLECT', label: 'Teklif Toplama' },
  { key: 'ORDER_CREATE', label: 'Sipariş Oluşturma' },
  { key: 'REQUEST_CLOSE', label: 'Talep Kapatma' },
  { key: 'SYSTEM_MANAGE', label: 'Sistem Yönetimi' },
  { key: 'INVENTORY_VIEW', label: 'Envanter Görüntüleme' },
  { key: 'INVENTORY_MANAGE', label: 'Envanter Yönetimi' },
];

export const OPERATION_KEYS = Object.keys(OPERATION_PERMISSION_MAP);

export function computeOperationsFromSelection(
  selection: Record<string, boolean>
): Record<string, boolean> {
  const ops: Record<string, boolean> = {};
  for (const key of OPERATION_KEYS) {
    const req = OPERATION_PERMISSION_MAP[key];
    ops[key] = req.length > 0 && req.every((p) => selection[p] === true);
  }
  return ops;
}

export function mergeSelectionForOperation(
  selection: Record<string, boolean>,
  opKey: string,
  enabled: boolean
): Record<string, boolean> {
  const next = { ...selection };
  for (const p of OPERATION_PERMISSION_MAP[opKey] || []) {
    next[p] = enabled;
  }
  return next;
}

/** API kataloğu + rolden gelen isimler */
export function buildPermissionSelectionFromRole(
  rolePermissionNames: string[],
  catalog: Permission[]
): Record<string, boolean> {
  const onRole = new Set(rolePermissionNames);
  const selection: Record<string, boolean> = {};
  for (const p of catalog) {
    if (p.isActive === false) continue;
    selection[p.name] = onRole.has(p.name);
  }
  for (const name of onRole) {
    if (selection[name] === undefined) {
      selection[name] = true;
    }
  }
  return selection;
}

export function initialEmptySelection(catalog: Permission[]): Record<string, boolean> {
  const selection: Record<string, boolean> = {};
  for (const p of catalog) {
    if (p.isActive === false) continue;
    selection[p.name] = false;
  }
  return selection;
}

export function groupCatalogByResource(catalog: Permission[]): Map<string, Permission[]> {
  const map = new Map<string, Permission[]>();
  for (const p of [...catalog].sort((a, b) => a.name.localeCompare(b.name))) {
    if (p.isActive === false) continue;
    const r = (p.resource && p.resource.trim()) || 'GENEL';
    if (!map.has(r)) map.set(r, []);
    map.get(r)!.push(p);
  }
  return map;
}
