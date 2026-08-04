import { useState } from 'react';
import { StockItem } from '../../types/warehouse';
import { StockItemDetailPanel } from './StockItemDetailPanel';

interface SerialStockItemSectionProps {
  productId: number;
  stockItems: StockItem[];
  loading: boolean;
  canManage: boolean;
  onRefresh: () => void;
  onImageClick?: (url: string) => void;
}

function statusBadgeClass(item: StockItem): string {
  if (item.allowsAssignment === true && item.status === 'IN_STOCK') {
    return 'bg-green-100 text-green-800';
  }
  if (item.status === 'ASSIGNED') {
    return 'bg-blue-100 text-blue-800';
  }
  if (item.status === 'MAINTENANCE') {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-gray-100 text-gray-800';
}

function statusLabel(item: StockItem): string {
  return (
    item.assetConditionName ||
    (item.status === 'IN_STOCK' && 'Stokta') ||
    (item.status === 'ASSIGNED' && 'Zimmetli') ||
    (item.status === 'MAINTENANCE' && 'Bakımda') ||
    (item.status === 'RETIRED' && 'Emekli') ||
    item.status
  );
}

export const SerialStockItemSection = ({
  productId,
  stockItems,
  loading,
  canManage,
  onRefresh,
  onImageClick,
}: SerialStockItemSectionProps) => {
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Liste yenilendiğinde açık modalın güncel kaydını tut
  const openItem =
    selectedItem == null
      ? null
      : stockItems.find((item) => Number(item.id) === Number(selectedItem.id)) ?? selectedItem;

  return (
    <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Depo Stokları</h3>
        <p className="mt-1 text-sm text-gray-500">
          Cihaz kartına tıklayarak zimmet, stok hareketi ve geçmişi yönetin
        </p>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : stockItems.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-gray-500">Henüz depoda cihaz yok.</p>
            <p className="text-sm text-indigo-600">
              Aşağıdaki &quot;Stok hareketleri → Manuel hareket&quot; ile seri numarası girerek ilk cihazı ekleyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {stockItems.map((item) => {
              const isSelected = openItem != null && Number(openItem.id) === Number(item.id);
              const title =
                [item.serialNumber, item.assetLabel].filter(Boolean).join(' · ') ||
                `Cihaz #${item.id}`;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left rounded-xl border bg-white p-4 shadow-sm transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isSelected
                      ? 'border-indigo-300 ring-2 ring-indigo-100'
                      : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          onClick={(e) => {
                            if (item.imageUrl && onImageClick) {
                              e.stopPropagation();
                              onImageClick(item.imageUrl);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                          Cihaz
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 truncate">{title}</p>
                        <span
                          className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(item)}`}
                        >
                          {statusLabel(item)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {item.warehouseName || 'Depo dışında'}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600 truncate">
                        {item.assignedUserName ? `Zimmet: ${item.assignedUserName}` : 'Zimmet yok'}
                      </p>
                      {item.isUnderWarranty && (
                        <span className="mt-2 inline-flex text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                          Garantili
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-indigo-600 font-medium">Yönet →</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {openItem && (
        <StockItemDetailPanel
          isOpen
          stockItem={openItem}
          productId={productId}
          canManage={canManage}
          onClose={() => setSelectedItem(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};
