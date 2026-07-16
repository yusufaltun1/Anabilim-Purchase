import { useCallback, useEffect, useMemo, useState } from 'react';
import { warehouseService } from '../../services/warehouse.service';
import { authService } from '../../services/auth.service';
import {
  CreateStockMovementRequest,
  StockItem,
  StockMovementDetail,
  Warehouse,
  WarehouseStock,
} from '../../types/warehouse';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/date';
import { getManualStockMovementConfig } from '../../utils/manualStockMovement';
import { LocationHierarchyPickers } from '../common/LocationHierarchyPickers';
import { resolveProductLocationPayload } from '../../utils/locationHierarchy';

const movementTypeLabel: Record<string, string> = {
  IN: 'Giriş',
  OUT: 'Çıkış',
  TRANSFER: 'Transfer',
  ADJUSTMENT: 'Düzeltme',
};

const referenceTypeLabel: Record<string, string> = {
  PURCHASE_ORDER: 'Satın alma',
  SALES_ORDER: 'Satış',
  TRANSFER: 'Transfer',
  ADJUSTMENT: 'Düzeltme',
  MANUAL: 'Manuel',
  ASSIGNMENT: 'Zimmet',
  ASSIGNMENT_RETURN: 'Zimmet iadesi',
};

interface ProductStockMovementSectionProps {
  productId: number;
  productType?: string | null;
  onStockChanged?: () => void;
}

export const ProductStockMovementSection = ({
  productId,
  productType,
  onStockChanged,
}: ProductStockMovementSectionProps) => {
  const { showNotification } = useNotification();
  const canManage = authService.hasCapability('INVENTORY_MANAGE');
  const movementConfig = useMemo(() => getManualStockMovementConfig(productType), [productType]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [productStockItems, setProductStockItems] = useState<StockItem[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovementDetail[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [inboundUnitCount, setInboundUnitCount] = useState(1);
  const [serialNumbers, setSerialNumbers] = useState<string[]>(['']);
  const [selectedStockItemId, setSelectedStockItemId] = useState<number | ''>('');
  const [referenceType, setReferenceType] = useState<CreateStockMovementRequest['referenceType']>('MANUAL');
  const [notes, setNotes] = useState('');
  const [locationRootId, setLocationRootId] = useState<number | null>(null);
  const [locationMiddleId, setLocationMiddleId] = useState<number | null>(null);
  const [locationLeafId, setLocationLeafId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [whList, stocks, detail, stockItems] = await Promise.all([
        warehouseService.getActiveWarehouses().catch(() => []),
        warehouseService.getProductStocks(productId).catch(() => []),
        warehouseService.getProductStockDetail(productId).catch(() => null),
        warehouseService.getProductStockItemsList(productId).catch(() => []),
      ]);
      setWarehouses(whList);
      setWarehouseStocks(stocks);
      setProductStockItems(stockItems);
      setRecentMovements(detail?.recentMovements ?? []);
      if (!warehouseId && stocks.length > 0) {
        setWarehouseId(stocks[0].warehouse?.id ?? stocks[0].warehouseId);
      } else if (!warehouseId && whList.length > 0) {
        setWarehouseId(whList[0].id);
      }
    } catch {
      showNotification('Stok bilgileri yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [productId, showNotification, warehouseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (movementConfig.showInboundUnitCount) {
      setSerialNumbers((prev) =>
        Array.from({ length: Math.max(1, inboundUnitCount) }, (_, i) => prev[i] ?? '')
      );
    }
  }, [inboundUnitCount, movementConfig.showInboundUnitCount]);

  useEffect(() => {
    if (movementConfig.mode === 'semi' && movementType === 'IN' && quantity > 0) {
      setSerialNumbers((prev) => Array.from({ length: quantity }, (_, i) => prev[i] ?? ''));
    }
  }, [quantity, movementType, movementConfig.mode]);

  const stockInWarehouse = (whId: number) =>
    warehouseStocks.find((s) => (s.warehouse?.id ?? s.warehouseId) === whId)?.currentStock ?? 0;

  const warehouseStockItems = useMemo(() => {
    if (!warehouseId) return [];
    return productStockItems.filter(
      (item) =>
        item.isStockItemRecord !== false &&
        item.status === 'IN_STOCK' &&
        item.warehouseId === Number(warehouseId) &&
        item.allowsAssignment !== false
    );
  }, [productStockItems, warehouseId]);

  const resetForm = () => {
    setNotes('');
    setQuantity(1);
    setInboundUnitCount(1);
    setSerialNumbers(['']);
    setSelectedStockItemId('');
    setMovementType('IN');
    setLocationRootId(null);
    setLocationMiddleId(null);
    setLocationLeafId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      showNotification('Depo seçin', 'error');
      return;
    }

    const payload: CreateStockMovementRequest = {
      movementType,
      referenceType,
      referenceId: 0,
      notes: notes.trim() || 'Manuel stok hareketi',
      quantity: 1,
    };

    if (movementConfig.showLocationPickers) {
      if (!locationRootId) {
        showNotification(
          movementType === 'IN' ? 'Giriş lokasyonu seçin' : 'Çıkış lokasyonu seçin',
          'error'
        );
        return;
      }
      const locationFields = resolveProductLocationPayload(
        locationRootId,
        locationMiddleId,
        locationLeafId
      );
      payload.parentLocationId = locationFields.defaultParentLocationId ?? undefined;
      payload.childLocationId = locationFields.defaultChildLocationId ?? undefined;
    }

    if (movementConfig.mode === 'serial') {
      if (movementType === 'IN') {
        const serials = serialNumbers.map((s) => s.trim()).filter(Boolean);
        if (movementConfig.serialRequired && serials.length !== inboundUnitCount) {
          showNotification('Tüm seri numaralarını girin', 'error');
          return;
        }
        if (serials.length === 0) {
          showNotification('En az bir seri numarası girin', 'error');
          return;
        }
        payload.serialNumbers = serials;
        payload.quantity = serials.length;
      } else if (movementType === 'OUT') {
        if (!selectedStockItemId) {
          showNotification('Çıkış için depodaki cihazı seçin', 'error');
          return;
        }
        payload.stockItemId = Number(selectedStockItemId);
        payload.quantity = 1;
      }
    } else if (movementConfig.mode === 'semi') {
      if (quantity < 1) {
        showNotification('Miktar en az 1 olmalı', 'error');
        return;
      }
      payload.quantity = quantity;
      if (movementType === 'IN') {
        const optionalSerials = serialNumbers.map((s) => s.trim()).filter(Boolean);
        if (optionalSerials.length > 0) {
          payload.serialNumbers = optionalSerials;
        }
      }
      const available = stockInWarehouse(Number(warehouseId));
      if (movementType === 'OUT' && quantity > available) {
        showNotification(`Bu depoda yalnızca ${available} adet var`, 'error');
        return;
      }
    } else {
      if (quantity < 1) {
        showNotification('Miktar en az 1 olmalı', 'error');
        return;
      }
      payload.quantity = quantity;
      const available = stockInWarehouse(Number(warehouseId));
      if (movementType === 'OUT' && quantity > available) {
        showNotification(`Bu depoda yalnızca ${available} adet var`, 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      await warehouseService.createStockMovementWithAutoStock(Number(warehouseId), productId, payload);
      showNotification('Stok hareketi kaydedildi', 'success');
      resetForm();
      setShowForm(false);
      await loadData();
      onStockChanged?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Stok hareketi kaydedilemedi';
      showNotification(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const movementTypeOptions: Array<'IN' | 'OUT' | 'ADJUSTMENT'> = movementConfig.allowAdjustment
    ? ['IN', 'OUT', 'ADJUSTMENT']
    : ['IN', 'OUT'];

  return (
    <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex flex-wrap justify-between items-center gap-3 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Stok hareketleri</h3>
          <p className="mt-1 text-sm text-gray-500">
            {movementConfig.label} — manuel giriş/çıkış ve hareket geçmişi
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {showForm ? 'Formu kapat' : 'Manuel hareket'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="px-4 py-5 bg-gray-50 border-b border-gray-200 space-y-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {movementConfig.description}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depo *</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={warehouseId}
                onChange={(e) => {
                  setWarehouseId(e.target.value ? Number(e.target.value) : '');
                  setSelectedStockItemId('');
                }}
                required
              >
                <option value="">Seçin</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code}) — mevcut: {stockInWarehouse(w.id)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hareket tipi *</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={movementType}
                onChange={(e) => {
                  setMovementType(e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT');
                  setSelectedStockItemId('');
                }}
              >
                {movementTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {movementTypeLabel[type]}
                  </option>
                ))}
              </select>
            </div>

            {movementConfig.showQuantity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Miktar *</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  required
                />
              </div>
            )}

            {movementConfig.showInboundUnitCount && movementType === 'IN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adet *</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={inboundUnitCount}
                  onChange={(e) => setInboundUnitCount(Math.max(1, Number(e.target.value) || 1))}
                  required
                />
              </div>
            )}

            {movementConfig.showStockItemPickerOnOut && movementType === 'OUT' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Depodaki cihaz *</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={selectedStockItemId}
                  onChange={(e) =>
                    setSelectedStockItemId(e.target.value ? Number(e.target.value) : '')
                  }
                  required
                >
                  <option value="">Cihaz seçin</option>
                  {warehouseStockItems.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {[item.serialNumber, item.assetLabel, item.assetConditionName]
                        .filter(Boolean)
                        .join(' · ') || `Cihaz #${item.id}`}
                    </option>
                  ))}
                </select>
                {warehouseId && warehouseStockItems.length === 0 && (
                  <p className="mt-1 text-xs text-amber-700">Bu depoda zimmete hazır cihaz yok.</p>
                )}
              </div>
            )}

            {movementConfig.showLocationPickers && (movementType === 'IN' || movementType === 'OUT') && (
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {movementType === 'IN' ? 'Giriş lokasyonu *' : 'Çıkış lokasyonu *'}
                </label>
                <LocationHierarchyPickers
                  rootId={locationRootId}
                  middleId={locationMiddleId}
                  leafId={locationLeafId}
                  onRootChange={(id) => {
                    setLocationRootId(id);
                    setLocationMiddleId(null);
                    setLocationLeafId(null);
                  }}
                  onMiddleChange={(id) => {
                    setLocationMiddleId(id);
                    setLocationLeafId(null);
                  }}
                  onLeafChange={setLocationLeafId}
                  showLeaf
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referans</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={referenceType}
                onChange={(e) =>
                  setReferenceType(e.target.value as CreateStockMovementRequest['referenceType'])
                }
              >
                <option value="MANUAL">Manuel</option>
                <option value="ADJUSTMENT">Düzeltme</option>
                <option value="TRANSFER">Transfer</option>
                <option value="PURCHASE_ORDER">Satın alma</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn. sayım farkı, iade, düzeltme"
              />
            </div>
          </div>

          {movementConfig.showSerialListOnIn && movementType === 'IN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seri numaraları{movementConfig.serialRequired ? ' *' : ' (opsiyonel)'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {serialNumbers.map((serial, index) => (
                  <div key={index}>
                    <span className="text-xs text-gray-500 mb-1 block">Adet {index + 1}</span>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={serial}
                      onChange={(e) => {
                        const next = [...serialNumbers];
                        next[index] = e.target.value;
                        setSerialNumbers(next);
                      }}
                      placeholder={movementConfig.serialRequired ? 'Seri no zorunlu' : 'Parti / seri no'}
                      required={movementConfig.serialRequired}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}

      <div className="border-t border-gray-200">
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
          </div>
        ) : recentMovements.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500 text-center">Henüz stok hareketi yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Miktar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referans</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasyon</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentMovements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {m.warehouseStock?.warehouse?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          m.movementType === 'IN'
                            ? 'bg-green-100 text-green-800'
                            : m.movementType === 'OUT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {movementTypeLabel[m.movementType] ?? m.movementType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{m.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {referenceTypeLabel[m.referenceType] ?? m.referenceType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {[m.parentLocationName, m.childLocationName].filter(Boolean).join(' / ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
