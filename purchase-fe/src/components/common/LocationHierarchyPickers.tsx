import { useEffect, useState } from 'react';
import { formSelect } from './formStyles';
import { inventoryService } from '../../services/inventory.service';
import {
  LOCATION_LEVEL_LABELS,
  findDefaultLocationId,
  formatLocationOptionLabel,
} from '../../utils/locationHierarchy';

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
              {formatLocationOptionLabel(loc.name, loc.isDefault)}
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
              {formatLocationOptionLabel(loc.name, loc.isDefault)}
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
                {formatLocationOptionLabel(loc.name, loc.isDefault)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
