import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { locationService } from '../services/location.service';
import { Location } from '../types/location';
import {
  LOCATION_LEVEL_LABELS,
  buildLocationTree,
  flattenLocationTree,
} from '../utils/locationHierarchy';

export const LocationList = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await locationService.getAllLocations();
      if (response.success && response.data) {
        const locationsData = Array.isArray(response.data) ? response.data : [response.data];
        setLocations(locationsData);
      } else {
        setError(response.message || 'Konumlar yüklenirken hata oluştu');
      }
    } catch {
      setError('Konumlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => flattenLocationTree(buildLocationTree(locations)), [locations]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu konumu silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await locationService.deleteLocation(id);
      if (response.success) {
        await loadLocations();
      } else {
        setError(response.message || 'Konum silinirken hata oluştu');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Konum silinirken hata oluştu');
    }
  };

  const levelBadgeClass = (level?: number) => {
    if (level === 1) return 'bg-indigo-100 text-indigo-800';
    if (level === 2) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Konumlar</h1>
              <p className="mt-1 text-sm text-gray-500">Üst → alt → detay olmak üzere en fazla 3 seviye</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/locations/create')}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Yeni Konum Ekle
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">{error}</div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Konumlar yükleniyor…</div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Henüz konum eklenmemiş.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seviye</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tam yol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map(({ node, depth }) => (
                    <tr key={node.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full ${levelBadgeClass(node.level ?? depth + 1)}`}
                        >
                          {LOCATION_LEVEL_LABELS[node.level ?? depth + 1] ?? `${depth + 1}. seviye`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center" style={{ paddingLeft: `${depth * 1.25}rem` }}>
                          {depth > 0 && <span className="mr-2 text-gray-300">└</span>}
                          <span className="font-medium text-gray-900">{node.name}</span>
                          {node.isDefault && (
                            <span className="ml-2 inline-flex px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
                              Varsayılan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{node.path || node.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{node.description || '—'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/locations/${node.id}`)}
                          className="text-indigo-600 text-sm font-medium"
                        >
                          Detay
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/locations/edit/${node.id}`)}
                          className="text-yellow-600 text-sm font-medium"
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(node.id)}
                          className="text-red-600 text-sm font-medium"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
