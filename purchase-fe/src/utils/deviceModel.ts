import type { DeviceModel } from '../services/inventory.service';

export function formatDeviceModelLabel(model: Pick<DeviceModel, 'name' | 'brand'>): string {
  const brand = model.brand?.trim();
  const name = model.name?.trim();
  if (brand && name) return `${brand} — ${name}`;
  return name || brand || '';
}
