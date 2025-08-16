import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { format } from 'date-fns';
import { FaArrowLeft, FaCheck, FaTimes, FaEdit, FaTruck, FaBoxOpen } from 'react-icons/fa';
import { AssetTransferService } from '../../services/asset-transfer.service';
import { AssetTransfer, TransferStatus, TransferItemUpdate } from '../../types/asset-transfer';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const TransferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<AssetTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showUpdateQuantity, setShowUpdateQuantity] = useState<number | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState<number>(0);

  useEffect(() => {
    loadTransfer();
  }, [id]);

  const loadTransfer = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await AssetTransferService.getTransferById(Number(id));
      setTransfer(data);
    } catch (error) {
      console.error('Error loading transfer:', error);
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: TransferStatus, reason?: string) => {
    if (!transfer?.id) return;
    try {
      setUpdating(true);
      const updatedTransfer = await AssetTransferService.updateStatus(transfer.id, status, reason);
      setTransfer(updatedTransfer);
      // TODO: Show success notification
    } catch (error) {
      console.error('Error updating status:', error);
      // TODO: Show error notification
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number) => {
    if (!transfer?.id || !updateQuantity) return;
    try {
      setUpdating(true);
      const update: TransferItemUpdate = {
        transferredQuantity: updateQuantity
      };
      const updatedTransfer = await AssetTransferService.updateTransferItem(transfer.id, itemId, update);
      setTransfer(updatedTransfer);
      setShowUpdateQuantity(null);
      setUpdateQuantity(0);
      // TODO: Show success notification
    } catch (error) {
      console.error('Error updating quantity:', error);
      // TODO: Show error notification
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeColor = (status: TransferStatus) => {
    const colors = {
      [TransferStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [TransferStatus.APPROVED]: 'bg-blue-100 text-blue-800',
      [TransferStatus.PREPARING]: 'bg-purple-100 text-purple-800',
      [TransferStatus.IN_TRANSIT]: 'bg-orange-100 text-orange-800',
      [TransferStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [TransferStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [TransferStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [TransferStatus.REJECTED]: 'bg-red-100 text-red-800',
      [TransferStatus.PARTIALLY_COMPLETED]: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">Transfer bulunamadı.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <button
                className="mr-4 text-gray-600 hover:text-gray-800"
                onClick={() => navigate('/transfers')}
              >
                <FaArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold">Transfer Detayı</h1>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Transfer Kodu</p>
                  <p className="font-medium">{transfer.transferCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(transfer.status)}`}>
                    {transfer.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kaynak Depo</p>
                  <p className="font-medium">Depo {transfer.sourceWarehouseId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hedef Okul</p>
                  <p className="font-medium">Okul {transfer.targetSchoolId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transfer Tarihi</p>
                  <p className="font-medium">{format(new Date(transfer.transferDate), 'dd.MM.yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Oluşturulma Tarihi</p>
                  <p className="font-medium">{format(new Date(transfer.createdAt!), 'dd.MM.yyyy HH:mm')}</p>
                </div>
                {transfer.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Notlar</p>
                    <p className="font-medium">{transfer.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {transfer.status === TransferStatus.PENDING && (
                    <>
                      <button
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        onClick={() => handleStatusUpdate(TransferStatus.APPROVED)}
                        disabled={updating}
                      >
                        <FaCheck className="mr-2" />
                        Onayla
                      </button>
                      <button
                        className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        onClick={() => handleStatusUpdate(TransferStatus.REJECTED)}
                        disabled={updating}
                      >
                        <FaTimes className="mr-2" />
                        Reddet
                      </button>
                    </>
                  )}
                  {transfer.status === TransferStatus.APPROVED && (
                    <button
                      className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                      onClick={() => handleStatusUpdate(TransferStatus.PREPARING)}
                      disabled={updating}
                    >
                      <FaBoxOpen className="mr-2" />
                      Hazırlamaya Başla
                    </button>
                  )}
                  {transfer.status === TransferStatus.PREPARING && (
                    <button
                      className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                      onClick={() => handleStatusUpdate(TransferStatus.IN_TRANSIT)}
                      disabled={updating}
                    >
                      <FaTruck className="mr-2" />
                      Sevkiyata Başla
                    </button>
                  )}
                  {transfer.status === TransferStatus.IN_TRANSIT && (
                    <button
                      className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      onClick={() => handleStatusUpdate(TransferStatus.DELIVERED)}
                      disabled={updating}
                    >
                      <FaCheck className="mr-2" />
                      Teslim Edildi
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Transfer Ürünleri</h2>
              <div className="space-y-4">
                {transfer.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Ürün</p>
                        <p className="font-medium">Ürün {item.productId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">İstenen Miktar</p>
                        <p className="font-medium">{item.requestedQuantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Transfer Edilen Miktar</p>
                        <div className="flex items-center">
                          <p className="font-medium">{item.transferredQuantity || 0}</p>
                          {[TransferStatus.PREPARING, TransferStatus.IN_TRANSIT].includes(transfer.status) && (
                            <button
                              className="ml-2 text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setShowUpdateQuantity(item.id);
                                setUpdateQuantity(item.transferredQuantity || item.requestedQuantity);
                              }}
                            >
                              <FaEdit />
                            </button>
                          )}
                        </div>
                        {showUpdateQuantity === item.id && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={item.requestedQuantity}
                              className="w-24 border rounded p-1"
                              value={updateQuantity}
                              onChange={(e) => setUpdateQuantity(Number(e.target.value))}
                            />
                            <button
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                              onClick={() => handleUpdateQuantity(item.id!)}
                              disabled={updating}
                            >
                              Güncelle
                            </button>
                            <button
                              className="px-2 py-1 border rounded hover:bg-gray-50"
                              onClick={() => setShowUpdateQuantity(null)}
                            >
                              İptal
                            </button>
                          </div>
                        )}
                      </div>
                      {item.serialNumbers && (
                        <div>
                          <p className="text-sm text-gray-500">Seri Numaraları</p>
                          <p className="font-medium">{item.serialNumbers}</p>
                        </div>
                      )}
                      {item.conditionNotes && (
                        <div>
                          <p className="text-sm text-gray-500">Durum Notları</p>
                          <p className="font-medium">{item.conditionNotes}</p>
                        </div>
                      )}
                      {item.notes && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Notlar</p>
                          <p className="font-medium">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDetail; 