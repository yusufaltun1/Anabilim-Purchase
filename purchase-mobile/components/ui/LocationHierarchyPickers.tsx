import { useAuth } from '@/contexts/AuthContext';
import { locationService } from '@/services/api/location.service';
import {
  buildLocationTree,
  findDefaultLocationId,
  formatLocationOptionLabel,
  type Location,
} from '@/services/types/location.types';
import React, { useEffect, useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Select, type SelectOption } from './Select';
import { Text } from './Text';

export type LocationNode = {
  id: number | string;
  name: string;
  isDefault?: boolean;
  children?: LocationNode[];
};

export type LocationHierarchyValue = {
  level1Id: string | number | null;
  level2Id: string | number | null;
  level3Id: string | number | null;
};

export type LocationHierarchyPickersProps = {
  /** Önceden yüklenmiş ağaç; verilmezse locationService ile yüklenir */
  locations?: LocationNode[];
  value: LocationHierarchyValue;
  onChange: (value: LocationHierarchyValue) => void;
  labels?: { level1?: string; level2?: string; level3?: string };
  required?: boolean;
  disabled?: boolean;
  /** Detay (3.) seviye seçiciyi göster — varsayılan true */
  showLeaf?: boolean;
  excludeIds?: number[];
  autoSelectDefaults?: boolean;
  style?: StyleProp<ViewStyle>;
};

function toOptions(
  nodes: LocationNode[] | undefined,
  excludeIds: number[]
): SelectOption<string>[] {
  return (nodes ?? [])
    .filter((n) => !excludeIds.includes(Number(n.id)))
    .map((n) => ({
      label: formatLocationOptionLabel(n.name, n.isDefault),
      value: String(n.id),
    }));
}

function findNode(nodes: LocationNode[], id: string | number | null): LocationNode | undefined {
  if (id === null || id === undefined) return undefined;
  return nodes.find((n) => String(n.id) === String(id));
}

function treeFromFlat(locations: Location[]): LocationNode[] {
  return buildLocationTree(locations).map(function mapNode(n): LocationNode {
    return {
      id: n.id,
      name: n.name,
      isDefault: n.isDefault,
      children: n.children.map(mapNode),
    };
  });
}

function toId(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * 3 seviyeli konum seçici.
 * locations verilmezse GET /api/locations ile yükler ve parentId'ye göre filtreler.
 */
export function LocationHierarchyPickers({
  locations: locationsProp,
  value,
  onChange,
  labels,
  required,
  disabled,
  showLeaf = true,
  excludeIds = [],
  autoSelectDefaults = false,
  style,
}: LocationHierarchyPickersProps) {
  const { token } = useAuth();
  const [fetched, setFetched] = useState<LocationNode[]>([]);
  const [loading, setLoading] = useState(!locationsProp);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  useEffect(() => {
    if (locationsProp) {
      setLoading(false);
      setLoadError(null);
      return;
    }
    if (!token) {
      setFetched([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const list = await locationService.getAllLocations(token);
        if (!cancelled) setFetched(treeFromFlat(list));
      } catch (err) {
        if (!cancelled) {
          setFetched([]);
          setLoadError(err instanceof Error ? err.message : 'Konumlar yüklenemedi');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locationsProp, token]);

  const locations = locationsProp ?? fetched;

  const level1 = findNode(locations, value.level1Id);
  const level2 = findNode(level1?.children ?? [], value.level2Id);

  useEffect(() => {
    if (!autoSelectDefaults || defaultsApplied || loading || locations.length === 0) return;
    if (value.level1Id != null) {
      setDefaultsApplied(true);
      return;
    }
    const rootDefault = findDefaultLocationId(
      locations.map((n) => ({ id: Number(n.id), isDefault: n.isDefault }))
    );
    if (rootDefault == null) {
      setDefaultsApplied(true);
      return;
    }
    const root = findNode(locations, rootDefault);
    const middleDefault = findDefaultLocationId(
      (root?.children ?? []).map((n) => ({ id: Number(n.id), isDefault: n.isDefault }))
    );
    const middle = middleDefault != null ? findNode(root?.children ?? [], middleDefault) : undefined;
    const leafDefault =
      showLeaf && middle
        ? findDefaultLocationId(
            (middle.children ?? []).map((n) => ({ id: Number(n.id), isDefault: n.isDefault }))
          )
        : null;

    onChange({
      level1Id: rootDefault,
      level2Id: middleDefault,
      level3Id: leafDefault,
    });
    setDefaultsApplied(true);
  }, [
    autoSelectDefaults,
    defaultsApplied,
    loading,
    locations,
    onChange,
    showLeaf,
    value.level1Id,
  ]);

  const rootOptions = useMemo(
    () => toOptions(locations, excludeIds),
    [locations, excludeIds]
  );
  const middleOptions = useMemo(
    () => toOptions(level1?.children, excludeIds),
    [level1?.children, excludeIds]
  );
  const leafOptions = useMemo(
    () => toOptions(level2?.children, excludeIds),
    [level2?.children, excludeIds]
  );

  const isDisabled = disabled || loading;

  return (
    <View style={style}>
      {loadError ? (
        <Text variant="caption" style={{ marginBottom: 8 }}>
          {loadError}
        </Text>
      ) : null}
      <Select
        label={labels?.level1 ?? 'Üst konum'}
        required={required}
        disabled={isDisabled}
        options={rootOptions}
        value={value.level1Id === null || value.level1Id === undefined ? null : String(value.level1Id)}
        onChange={(next) =>
          onChange({
            level1Id: toId(next),
            level2Id: null,
            level3Id: null,
          })
        }
        placeholder={loading ? 'Yükleniyor…' : 'Seçiniz'}
      />
      <Select
        label={labels?.level2 ?? 'Alt konum'}
        disabled={isDisabled || !value.level1Id}
        options={middleOptions}
        value={value.level2Id === null || value.level2Id === undefined ? null : String(value.level2Id)}
        onChange={(next) =>
          onChange({
            ...value,
            level2Id: toId(next),
            level3Id: null,
          })
        }
      />
      {showLeaf ? (
        <Select
          label={labels?.level3 ?? 'Detay konum'}
          disabled={isDisabled || !value.level2Id}
          options={leafOptions}
          value={
            value.level3Id === null || value.level3Id === undefined ? null : String(value.level3Id)
          }
          onChange={(next) =>
            onChange({
              ...value,
              level3Id: toId(next),
            })
          }
        />
      ) : null}
    </View>
  );
}

/** Seçilen en derin konum id'si */
export function resolveSelectedLocationId(value: LocationHierarchyValue): number | null {
  const id = value.level3Id ?? value.level2Id ?? value.level1Id;
  if (id === null || id === undefined || id === '') return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}
