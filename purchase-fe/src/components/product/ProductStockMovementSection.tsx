import { useCallback, useEffect, useState } from 'react';
import { warehouseService } from '../../services/warehouse.service';
import { authService } from '../../services/auth.service';
import {
  CreateStockMovementRequest,
  StockMovementDetail,
  Warehouse,
  WarehouseStock,
} from '../../types/warehouse';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/date';

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
  onStockChanged?: () => void;
}

export const ProductStockMovementSection = ({ productId, onStockChanged }: ProductStockMovementSectionProps) => {
  const { showNotification } = useNotification();
  const canManage = authService.hasCapability('INVENTORY_MANAGE');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovementDetail[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [referenceType, setReferenceType] = useState<CreateStockMovementRequest['referenceType']>('MANUAL');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [whList, stocks, detail] = await Promise.all([
        warehouseService.getActiveWarehouses().catch(() => []),
        warehouseService.getProductStocks(productId).catch(() => []),
        warehouseService.getProductStockDetail(productId).catch(() => null),
      ]);
      setWarehouses(whList);
      setWarehouseStocks(stocks);
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
  }, [productId, showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stockInWarehouse = (whId: number) =>
    warehouseStocks.find((s) => (s.warehouse?.id ?? s.warehouseId) === whId)?.currentStock ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      showNotification('Depo seçin', 'error');
      return;
    }
    if (quantity < 1) {
      showNotification('Miktar en az 1 olmalı', 'error');
      return;
    }
    const available = stockInWarehouse(Number(warehouseId));
    if (movementType === 'OUT' && quantity > available) {
      showNotification(`Bu depoda yalnızca ${available} adet var`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      await warehouseService.createStockMovementWithAutoStock(Number(warehouseId), productId, {
        movementType,
        quantity,
        referenceType,
        referenceId: 0,
        notes: notes.trim() || 'Manuel stok hareketi',
      });
      showNotification('Stok hareketi kaydedildi', 'success');
      setNotes('');
      setQuantity(1);
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

  return (
    <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex flex-wrap justify-between items-center gap-3 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Stok hareketleri</h3>
          <p className="mt-1 text-sm text-gray-500">Manuel giriş/çıkış ve hareket geçmişi</p>
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
        <form onSubmit={handleSubmit} className="px-4 py-5 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depo *</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : '')}
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
                onChange={(e) => setMovementType(e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT')}
              >
                <option value="IN">Giriş</option>
                <option value="OUT">Çıkış</option>
                <option value="ADJUSTMENT">Düzeltme</option>
              </select>
            </div>
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
          <div className="mt-4 flex justify-end gap-2">
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
