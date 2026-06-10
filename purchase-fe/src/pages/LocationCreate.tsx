import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { LocationHierarchyPickers } from '../components/common/LocationHierarchyPickers';
import { locationService } from '../services/location.service';
import { CreateLocationRequest } from '../types/location';
import {
  LOCATION_LEVEL_LABELS,
  newLocationLevel,
  resolveParentForNewLocation,
} from '../utils/locationHierarchy';

export const LocationCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [parentRootId, setParentRootId] = useState<number | null>(null);
  const [parentMiddleId, setParentMiddleId] = useState<number | null>(null);
  const [allLocations, setAllLocations] = useState<{ id: number; level?: number }[]>([]);
  const [formData, setFormData] = useState<CreateLocationRequest>({
    name: '',
    description: '',
  });

  useEffect(() => {
    locationService.getAllLocations().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setAllLocations(res.data);
      }
    });
  }, []);

  const parentId = resolveParentForNewLocation(parentRootId, parentMiddleId);
  const targetLevel = useMemo(
    () => newLocationLevel(parentId, allLocations as Parameters<typeof newLocationLevel>[1]),
    [parentId, allLocations]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Konum adı zorunludur');
      return;
    }
    if (targetLevel > 3) {
      setError('En fazla 3 seviye konum tanımlanabilir');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload: CreateLocationRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || formData.name.trim(),
        parentId,
      };
      const response = await locationService.createLocation(payload);
      if (response.success) {
        setSuccessMessage(response.message);
        setTimeout(() => navigate('/locations'), 1500);
      } else {
        setError(response.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Konum oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Yeni Konum</h1>
            <button
              type="button"
              onClick={() => navigate('/locations')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white"
              disabled={loading}
            >
              Geri
            </button>
          </div>

          {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg sm:p-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Üst konum seçimi</h2>
              <p className="mt-1 text-sm text-gray-500">
                Boş bırakırsanız 1. seviye (üst) konum oluşturulur. Alt seçerseniz 2., ikisini de seçerseniz 3. seviye
                oluşturulur.
              </p>
              <div className="mt-4">
                <LocationHierarchyPickers
                  rootId={parentRootId}
                  middleId={parentMiddleId}
                  onRootChange={setParentRootId}
                  onMiddleChange={setParentMiddleId}
                  disabled={loading}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
                Oluşturulacak seviye:{' '}
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
                placeholder="Örn. Kampüs A / Bina 1 / Oda 101"
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
                placeholder="İsteğe bağlı açıklama"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/locations')} disabled={loading} className="px-4 py-2 border rounded-md text-sm bg-white">
                İptal
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
