import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { AssetTransferService } from '../../services/asset-transfer.service';
import {
  AssetTransfer,
  PaginatedTransfers,
  TransferFilters,
  TransferStatus
} from '../../types/asset-transfer';
import { format } from 'date-fns';
import { FaSearch, FaFilter, FaSync } from 'react-icons/fa';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const TransferList: React.FC = () => {
  const [transfers, setTransfers] = useState<PaginatedTransfers>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0
  });

  const [filters, setFilters] = useState<TransferFilters>({
    page: 0,
    size: 10,
    sort: 'createdAt,desc'
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const data = await AssetTransferService.getTransfers(filters);
      setTransfers(data);
    } catch (error) {
      console.error('Error loading transfers:', error);
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [filters]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        const data = await AssetTransferService.searchTransfers(searchQuery, filters.page, filters.size);
        setTransfers(data);
      } catch (error) {
        console.error('Error searching transfers:', error);
        // TODO: Show error notification
      } finally {
        setLoading(false);
      }
    } else {
      loadTransfers();
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (field: keyof TransferFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 0 }));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Varlık Transferleri</h1>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => navigate('/transfers/create')}
            >
              Yeni Transfer
            </button>
          </div>

          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Transfer kodu, okul veya depo ara..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="inline-block mr-2" />
                Filtreler
              </button>
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                onClick={loadTransfers}
              >
                <FaSync className="inline-block mr-2" />
                Yenile
              </button>
            </div>

            {showFilters && (
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durum
                    </label>
                    <select
                      className="w-full border rounded-lg p-2"
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    >
                      <option value="">Tümü</option>
                      {Object.values(TransferStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-lg p-2"
                      value={filters.startDate || ''}
                      onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-lg p-2"
                      value={filters.endDate || ''}
                      onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transfer Kodu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kaynak Depo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hedef Okul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transfer Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : transfers.content.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        Transfer bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    transfers.content.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium">{transfer.transferCode}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(transfer.status)}`}>
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Depo {transfer.sourceWarehouseId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Okul {transfer.targetSchoolId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {format(new Date(transfer.transferDate), 'dd.MM.yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => {/* TODO: Navigate to detail */}}
                          >
                            Detay
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {transfers.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === transfers.totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sonraki
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Toplam <span className="font-medium">{transfers.totalElements}</span> transfer
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(filters.page! - 1)}
                        disabled={filters.page === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Önceki
                      </button>
                      {[...Array(transfers.totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            index === filters.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(filters.page! + 1)}
                        disabled={filters.page === transfers.totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Sonraki
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferList; 