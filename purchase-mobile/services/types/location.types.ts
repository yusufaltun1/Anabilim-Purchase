export type Location = {
  id: number;
  name: string;
  description: string;
  parentId?: number | null;
  parentName?: string | null;
  level?: number;
  path?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateLocationRequest = {
  name: string;
  description: string;
  parentId?: number | null;
  isDefault?: boolean;
};

export type UpdateLocationRequest = {
  name: string;
  description: string;
  parentId?: number | null;
  isDefault?: boolean;
};

export type LocationProductSummary = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
};

export type LocationNode = Location & {
  children: LocationNode[];
};

export type FlatLocationRow = {
  location: Location;
  depth: number;
};

export type LocationFormValues = {
  name: string;
  description: string;
  isDefault: boolean;
  parentRootId: number | null;
  parentMiddleId: number | null;
};

export const LOCATION_LEVEL_LABELS: Record<number, string> = {
  1: 'Üst konum',
  2: 'Alt konum',
  3: 'Detay konum',
};

export const LOCATION_LEVEL_SHORT: Record<number, string> = {
  1: 'Üst',
  2: 'Alt',
  3: 'Detay',
};

export const MAX_LOCATION_LEVEL = 3;

export function emptyLocationForm(): LocationFormValues {
  return {
    name: '',
    description: '',
    isDefault: false,
    parentRootId: null,
    parentMiddleId: null,
  };
}

export function mapApiToLocation(raw: Record<string, unknown>): Location {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    parentId: (raw.parentId as number | null | undefined) ?? null,
    parentName: (raw.parentName as string | null | undefined) ?? null,
    level: typeof raw.level === 'number' ? raw.level : undefined,
    path: typeof raw.path === 'string' ? raw.path : undefined,
    isDefault: raw.isDefault === true,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
}

export function mapApiToLocationProduct(raw: Record<string, unknown>): LocationProductSummary {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? `Ürün #${raw.id}`),
    code: typeof raw.code === 'string' ? raw.code : undefined,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    isActive: raw.isActive === true || raw.active === true,
  };
}

export function resolveParentForNewLocation(
  rootId: number | null,
  middleId: number | null
): number | null {
  return middleId ?? rootId ?? null;
}

export function newLocationLevel(parentId: number | null, locations: Location[]): number {
  if (!parentId) return 1;
  const parent = locations.find((l) => l.id === parentId);
  return (parent?.level ?? 1) + 1;
}

export function findDefaultLocationId(
  items: Array<{ id: number; isDefault?: boolean | null }>
): number | null {
  return items.find((item) => item.isDefault === true)?.id ?? null;
}

export function formatLocationOptionLabel(name: string, isDefault?: boolean): string {
  return isDefault ? `${name} (Varsayılan)` : name;
}

/** Mevcut konumun üst zincirini seçim alanlarına yansıtır */
export function parentPickersForLocation(
  locations: Location[],
  locationId: number
): { rootId: number | null; middleId: number | null } {
  const byId = new Map(locations.map((l) => [l.id, l]));
  const current = byId.get(locationId);
  if (!current?.parentId) {
    return { rootId: null, middleId: null };
  }
  const parent = byId.get(current.parentId);
  if (!parent) {
    return { rootId: current.parentId, middleId: null };
  }
  if (!parent.parentId) {
    return { rootId: parent.id, middleId: null };
  }
  const grandParent = byId.get(parent.parentId);
  return {
    rootId: grandParent?.id ?? parent.parentId,
    middleId: parent.id,
  };
}

export function buildLocationTree(locations: Location[]): LocationNode[] {
  const byId = new Map<number, LocationNode>();
  locations.forEach((loc) => {
    byId.set(loc.id, { ...loc, children: [] });
  });

  const roots: LocationNode[] = [];
  byId.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else if (!node.parentId) {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: LocationNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

/** Hiyerarşiyi liste için düzleştirir; indent depth en fazla maxDepth-1 (varsayılan 3 seviye). */
export function flattenLocationHierarchy(
  locations: Location[],
  maxDepth = MAX_LOCATION_LEVEL
): FlatLocationRow[] {
  const tree = buildLocationTree(locations);
  const rows: FlatLocationRow[] = [];

  const walk = (nodes: LocationNode[], depth: number) => {
    nodes.forEach((node) => {
      const displayDepth = Math.min(depth, maxDepth - 1);
      rows.push({ location: node, depth: displayDepth });
      if (node.children.length > 0) {
        walk(node.children, depth + 1);
      }
    });
  };

  walk(tree, 0);
  return rows;
}

export type LocationPickerNode = {
  id: number;
  name: string;
  isDefault?: boolean;
  children: LocationPickerNode[];
};

export function locationsToPickerTree(
  locations: Location[],
  excludeIds: number[] = []
): LocationPickerNode[] {
  const excluded = new Set(excludeIds);
  const filtered = locations.filter((l) => !excluded.has(l.id));
  const tree = buildLocationTree(filtered);

  const mapNode = (node: LocationNode, depth: number): LocationPickerNode => ({
    id: node.id,
    name: formatLocationOptionLabel(node.name, node.isDefault),
    isDefault: node.isDefault,
    children: depth < 2 ? node.children.map((c) => mapNode(c, depth + 1)) : [],
  });

  return tree.map((n) => mapNode(n, 0));
}

export function validateLocationForm(
  values: LocationFormValues,
  locations: Location[]
): { ok: true } | { ok: false; message: string } {
  if (!values.name.trim()) {
    return { ok: false, message: 'Konum adı zorunludur' };
  }
  const parentId = resolveParentForNewLocation(values.parentRootId, values.parentMiddleId);
  const level = newLocationLevel(parentId, locations);
  if (level > MAX_LOCATION_LEVEL) {
    return { ok: false, message: 'En fazla 3 seviye konum tanımlanabilir' };
  }
  return { ok: true };
}

export function formatLocationDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
