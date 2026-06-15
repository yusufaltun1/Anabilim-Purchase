import { useEffect, useState } from 'react';
import { formSelect } from './formStyles';
import { inventoryService } from '../../services/inventory.service';
import { LOCATION_LEVEL_LABELS } from '../../utils/locationHierarchy';

interface LocationOption {
  id: number;
  name: string;
}

interface LocationHierarchyPickersProps {
  rootId: number | null;
  middleId: number | null;
  leafId?: number | null;
  onRootChange: (id: number | null) => void;
  onMiddleChange: (id: number | null) => void;
  onLeafChange?: (id: number | null) => void;
  showLeaf?: boolean;
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
  disabled = false,
  excludeIds = [],
  reloadToken = 0,
}: LocationHierarchyPickersProps) => {
  const [roots, setRoots] = useState<LocationOption[]>([]);
  const [middles, setMiddles] = useState<LocationOption[]>([]);
  const [leaves, setLeaves] = useState<LocationOption[]>([]);

  useEffect(() => {
    inventoryService.getParentLocations().then(setRoots).catch(() => setRoots([]));
  }, [reloadToken]);

  useEffect(() => {
    if (!rootId) {
      setMiddles([]);
      return;
    }
    inventoryService.getChildLocations(rootId).then(setMiddles).catch(() => setMiddles([]));
  }, [rootId, reloadToken]);

  useEffect(() => {
    if (!middleId) {
      setLeaves([]);
      return;
    }
    inventoryService.getChildLocations(middleId).then(setLeaves).catch(() => setLeaves([]));
  }, [middleId, reloadToken]);

  const filterExcluded = (items: LocationOption[]) =>
    excludeIds.length ? items.filter((item) => !excludeIds.includes(item.id)) : items;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{LOCATION_LEVEL_LABELS[1]}</label>
        <select
          className={formSelect}
          value={rootId ?? ''}
          disabled={disabled}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            onRootChange(id);
            onMiddleChange(null);
            onLeafChange?.(null);
          }}
        >
          <option value="">{showLeaf ? 'Seçin' : 'Yok (1. seviye oluştur)'}</option>
          {filterExcluded(roots).map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{LOCATION_LEVEL_LABELS[2]}</label>
        <select
          className={formSelect}
          value={middleId ?? ''}
          disabled={disabled || !rootId}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            onMiddleChange(id);
            onLeafChange?.(null);
          }}
        >
          <option value="">{showLeaf ? 'Seçin' : 'Yok (2. seviye oluştur)'}</option>
          {filterExcluded(middles).map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {showLeaf && (
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{LOCATION_LEVEL_LABELS[3]}</label>
          <select
            className={formSelect}
            value={leafId ?? ''}
            disabled={disabled || !middleId}
            onChange={(e) => onLeafChange?.(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Seçin</option>
            {filterExcluded(leaves).map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
