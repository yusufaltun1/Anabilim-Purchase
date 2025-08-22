import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { supplierService } from '../services/supplier.service';
import { Supplier } from '../types/supplier';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const SupplierList = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.getAllSuppliers();
      if (response.success) {
        setSuppliers(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Tedarikçiler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu tedarikçiyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await supplierService.deleteSupplier(id);
      if (response.success) {
        loadSuppliers();
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Tedarikçi silinirken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tedarikçiler</h1>
            <button
              onClick={() => navigate('/suppliers/create')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Yeni Tedarikçi
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Firma Adı
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vergi No / Vergi Dairesi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İletişim Bilgileri
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">İşlemler</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            Yükleniyor...
                          </td>
                        </tr>
                      ) : suppliers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            Tedarikçi bulunamadı
                          </td>
                        </tr>
                      ) : (
                        suppliers.map((supplier) => (
                          <tr key={supplier.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{supplier.taxNumber}</div>
                              <div className="text-sm text-gray-500">{supplier.taxOffice}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{supplier.contactPerson}</div>
                              <div className="text-sm text-gray-500">{supplier.contactPhone}</div>
                              <div className="text-sm text-gray-500">{supplier.contactEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                supplier.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {supplier.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                title="Düzenle"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(supplier.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Sil"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 