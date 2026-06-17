import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { LocationHierarchyPickers } from '../components/common/LocationHierarchyPickers';
import { locationService } from '../services/location.service';
import { Location, UpdateLocationRequest } from '../types/location';
import {
  LOCATION_LEVEL_LABELS,
  newLocationLevel,
  parentPickersForLocation,
  resolveParentForNewLocation,
} from '../utils/locationHierarchy';

export const LocationEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const locationId = id ? parseInt(id, 10) : NaN;

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [parentRootId, setParentRootId] = useState<number | null>(null);
  const [parentMiddleId, setParentMiddleId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UpdateLocationRequest>({
    name: '',
    description: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!Number.isNaN(locationId)) {
      loadData(locationId);
    }
  }, [locationId]);

  const loadData = async (locId: number) => {
    try {
      setInitialLoading(true);
      const [location, allRes] = await Promise.all([
        locationService.getLocationById(locId),
        locationService.getAllLocations(),
      ]);
      const locations = allRes.success && Array.isArray(allRes.data) ? allRes.data : [];
      setAllLocations(locations);
      const pickers = parentPickersForLocation(locations, locId);
      setParentRootId(pickers.rootId);
      setParentMiddleId(pickers.middleId);
      setFormData({
        name: location.name,
        description: location.description || '',
        isDefault: Boolean(location.isDefault),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Konum yüklenirken hata oluştu');
    } finally {
      setInitialLoading(false);
    }
  };

  const parentId = resolveParentForNewLocation(parentRootId, parentMiddleId);
  const targetLevel = useMemo(
    () => newLocationLevel(parentId, allLocations),
    [parentId, allLocations]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Konum adı gereklidir');
      return;
    }
    if (Number.isNaN(locationId)) {
      setError('Geçersiz konum ID');
      return;
    }
    if (targetLevel > 3) {
      setError('En fazla 3 seviye konum tanımlanabilir');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await locationService.updateLocation(locationId, {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentId,
        isDefault: formData.isDefault,
      });
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/locations'), 1500);
      } else {
        setError(response.message || 'Konum güncellenirken hata oluştu');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Konum güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Konum Düzenle</h1>
            <button type="button" onClick={() => navigate('/locations')} className="px-4 py-2 border rounded-md text-sm bg-white">
              Geri
            </button>
          </div>

          {success && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Konum güncellendi. Yönlendiriliyorsunuz…
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg sm:p-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Üst konum</h2>
              <p className="mt-1 text-sm text-gray-500">Bu konumun bağlı olduğu üst hiyerarşiyi seçin.</p>
              <div className="mt-4">
                <LocationHierarchyPickers
                  rootId={parentRootId}
                  middleId={parentMiddleId}
                  onRootChange={setParentRootId}
                  onMiddleChange={setParentMiddleId}
                  disabled={loading}
                  excludeIds={[locationId]}
                  autoSelectDefaults={false}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
                Seviye:{' '}
                <span className="font-medium">{LOCATION_LEVEL_LABELS[targetLevel] ?? `${targetLevel}. seviye`}</span>
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Konum adı *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                id="isDefault"
                type="checkbox"
                checked={Boolean(formData.isDefault)}
                onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
                disabled={loading}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-900">
                  Bu seviyede varsayılan konum
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Aynı üst konum altında yalnızca bir varsayılan olabilir.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/locations')} className="px-4 py-2 border rounded-md text-sm bg-white">
                İptal
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-sm text-white bg-indigo-600 disabled:opacity-50">
                {loading ? 'Kaydediliyor…' : 'Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
