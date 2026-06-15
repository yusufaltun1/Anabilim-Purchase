import type { Location } from '../types/location';

export const LOCATION_LEVEL_LABELS: Record<number, string> = {
  1: 'Üst konum',
  2: 'Alt konum',
  3: 'Detay konum',
};

export interface LocationNode extends Location {
  children: LocationNode[];
}

export function resolveParentForNewLocation(rootId: number | null, middleId: number | null): number | null {
  return middleId ?? rootId ?? null;
}

export function resolveProductLocationPayload(
  rootId: number | null,
  middleId: number | null,
  leafId: number | null
) {
  return {
    defaultParentLocationId: rootId,
    defaultChildLocationId: leafId ?? middleId ?? null,
  };
}

export function resolveUserWorkLocationPayload(
  rootId: number | null,
  middleId: number | null,
  leafId: number | null
) {
  const { defaultParentLocationId, defaultChildLocationId } = resolveProductLocationPayload(
    rootId,
    middleId,
    leafId
  );
  return {
    workLocationParentId: defaultParentLocationId,
    workLocationChildId: defaultChildLocationId,
  };
}

export function resolveProductLocationLevels(
  locations: Location[],
  rootId: number | null,
  childId: number | null
) {
  if (!rootId && !childId) {
    return { rootId: null as number | null, middleId: null as number | null, leafId: null as number | null };
  }
  if (!childId) {
    return { rootId, middleId: null, leafId: null };
  }

  const byId = new Map(locations.map((l) => [l.id, l]));
  const chain: number[] = [];
  let current = byId.get(childId);
  while (current) {
    chain.unshift(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  if (chain.length === 1) {
    return { rootId: chain[0], middleId: null, leafId: null };
  }
  if (chain.length === 2) {
    return { rootId: chain[0], middleId: chain[1], leafId: null };
  }
  return { rootId: chain[0], middleId: chain[1], leafId: chain[2] };
}

export function resolveParentChain(locations: Location[], locationId: number | null) {
  if (!locationId) {
    return { rootId: null as number | null, middleId: null as number | null };
  }
  const byId = new Map(locations.map((l) => [l.id, l]));
  const chain: number[] = [];
  let current = byId.get(locationId);
  while (current) {
    chain.unshift(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  if (chain.length <= 1) {
    return { rootId: null, middleId: null };
  }
  return {
    rootId: chain[chain.length - 2] ?? null,
    middleId: chain.length >= 3 ? chain[chain.length - 2] : chain[chain.length - 2],
  };
}

/** Mevcut konumun üst zincirini seçim alanlarına yansıtır */
export function parentPickersForLocation(locations: Location[], locationId: number) {
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

export function flattenLocationTree(
  nodes: LocationNode[],
  depth = 0
): Array<{ node: LocationNode; depth: number }> {
  const rows: Array<{ node: LocationNode; depth: number }> = [];
  nodes.forEach((node) => {
    rows.push({ node, depth });
    rows.push(...flattenLocationTree(node.children, depth + 1));
  });
  return rows;
}

export function newLocationLevel(parentId: number | null, locations: Location[]): number {
  if (!parentId) return 1;
  const parent = locations.find((l) => l.id === parentId);
  return (parent?.level ?? 1) + 1;
}
