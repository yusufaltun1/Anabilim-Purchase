import { Badge, type BadgeTone } from '@/components/ui';
import {
  LOCATION_LEVEL_SHORT,
  type Location,
} from '@/services/types/location.types';
import React from 'react';

export type LocationLevelBadgeProps = {
  level?: number | null;
  depth?: number;
};

function resolveLevel(level?: number | null, depth?: number): number {
  if (typeof level === 'number' && level >= 1) return Math.min(level, 3);
  if (typeof depth === 'number') return Math.min(depth + 1, 3);
  return 1;
}

function toneForLevel(level: number): BadgeTone {
  if (level === 1) return 'primary';
  if (level === 2) return 'info';
  return 'neutral';
}

export function LocationLevelBadge({ level, depth }: LocationLevelBadgeProps) {
  const resolved = resolveLevel(level, depth);
  const label = LOCATION_LEVEL_SHORT[resolved] ?? `${resolved}`;
  return <Badge label={label} tone={toneForLevel(resolved)} />;
}

export function locationLevelFromItem(location: Location, depth?: number): number {
  return resolveLevel(location.level, depth);
}
