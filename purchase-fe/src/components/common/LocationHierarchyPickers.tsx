import { useEffect, useMemo, useState } from 'react';
import { inventoryService } from '../../services/inventory.service';
import {
  LOCATION_LEVEL_LABELS,
  findDefaultLocationId,
  formatLocationOptionLabel,
} from '../../utils/locationHierarchy';
import { SearchableOptionSelect, type SelectOption } from './SearchableOptionSelect';

interface LocationOption {
  id: number;
  name: string;
  isDefault?: boolean;
}

interface LocationHierarchyPickersProps {
  rootId: number | null;
  middleId: number | null;
  leafId?: number | null;
  onRootChange: (id: number | null) => void;
  onMiddleChange: (id: number | null) => void;
  onLeafChange?: (id: number | null) => void;
  showLeaf?: boolean;
  /** Seçim modunda varsayılan konumları otomatik seç */
  autoSelectDefaults?: boolean;
  disabled?: boolean;
  excludeIds?: number[];
  reloadToken?: number;
}

export const LocationHierarchyPickers = ({
  rootId,
  middleId,
  leafId = null,
  onRootChange,
  onMiddleChange,
  onLeafChange,
  showLeaf = false,
  autoSelectDefaults,
  disabled = false,
  excludeIds = [],
  reloadToken = 0,
}: LocationHierarchyPickersProps) => {
  const shouldAutoSelect = autoSelectDefaults ?? showLeaf;
  const [roots, setRoots] = useState<LocationOption[]>([]);
  const [middles, setMiddles] = useState<LocationOption[]>([]);
  const [leaves, setLeaves] = useState<LocationOption[]>([]);

  useEffect(() => {
    inventoryService.getParentLocations().then((items) => {
      setRoots(items);
      if (shouldAutoSelect && !rootId) {
        const defaultId = findDefaultLocationId(items);
        if (defaultId) onRootChange(defaultId);
      }
    }).catch(() => setRoots([]));
  }, [reloadToken, shouldAutoSelect]);

  useEffect(() => {
    if (!rootId) {
      setMiddles([]);
      return;
    }
    inventoryService.getChildLocations(rootId).then((items) => {
      setMiddles(items);
      if (shouldAutoSelect && !middleId) {
        const defaultId = findDefaultLocationId(items);
        if (defaultId) onMiddleChange(defaultId);
      }
    }).catch(() => setMiddles([]));
  }, [rootId, reloadToken, shouldAutoSelect]);

  useEffect(() => {
    if (!middleId) {
      setLeaves([]);
      return;
    }
    inventoryService.getChildLocations(middleId).then((items) => {
      setLeaves(items);
      if (shouldAutoSelect && showLeaf && !leafId) {
        const defaultId = findDefaultLocationId(items);
        if (defaultId) onLeafChange?.(defaultId);
      }
    }).catch(() => setLeaves([]));
  }, [middleId, reloadToken, shouldAutoSelect, showLeaf]);

  const filterExcluded = (items: LocationOption[]) =>
    excludeIds.length ? items.filter((item) => !excludeIds.includes(item.id)) : items;

  const rootOptions = useMemo<SelectOption<number>[]>(
    () =>
      filterExcluded(roots).map((loc) => ({
        value: loc.id,
        label: formatLocationOptionLabel(loc.name, loc.isDefault),
        searchText: loc.name,
      })),
    [roots, excludeIds]
  );

  const middleOptions = useMemo<SelectOption<number>[]>(
    () =>
      filterExcluded(middles).map((loc) => ({
        value: loc.id,
        label: formatLocationOptionLabel(loc.name, loc.isDefault),
        searchText: loc.name,
      })),
    [middles, excludeIds]
  );

  const leafOptions = useMemo<SelectOption<number>[]>(
    () =>
      filterExcluded(leaves).map((loc) => ({
        value: loc.id,
        label: formatLocationOptionLabel(loc.name, loc.isDefault),
        searchText: loc.name,
      })),
    [leaves, excludeIds]
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{LOCATION_LEVEL_LABELS[1]}</label>
        <SearchableOptionSelect
          options={rootOptions}
          value={rootId}
          disabled={disabled}
          onChange={(value) => {
            const id = typeof value === 'number' ? value : null;
            onRootChange(id);
            onMiddleChange(null);
            onLeafChange?.(null);
          }}
          placeholder={showLeaf ? 'Üst konum ara…' : 'Yok (1. seviye oluştur)'}
          allowClear
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{LOCATION_LEVEL_LABELS[2]}</label>
        <SearchableOptionSelect
          options={middleOptions}
          value={middleId}
          disabled={disabled || !rootId}
          onChange={(value) => {
            const id = typeof value === 'number' ? value : null;
            onMiddleChange(id);
            onLeafChange?.(null);
          }}
          placeholder={showLeaf ? 'Alt konum ara…' : 'Yok (2. seviye oluştur)'}
          allowClear
        />
      </div>

      {showLeaf && (
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{LOCATION_LEVEL_LABELS[3]}</label>
          <SearchableOptionSelect
            options={leafOptions}
            value={leafId}
            disabled={disabled || !middleId}
            onChange={(value) => onLeafChange?.(typeof value === 'number' ? value : null)}
            placeholder="Detay konum ara…"
            allowClear
          />
        </div>
      )}
    </div>
  );
};
