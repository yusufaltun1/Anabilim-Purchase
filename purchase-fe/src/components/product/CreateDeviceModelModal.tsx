import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DeviceModel, inventoryService } from '../../services/inventory.service';
import { formGrid, formInput, formSelect } from '../common/formStyles';

const NEW_BRAND_VALUE = '__new__';

interface CreateDeviceModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (model: DeviceModel) => void | Promise<void>;
}

export const CreateDeviceModelModal = ({ isOpen, onClose, onCreated }: CreateDeviceModelModalProps) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandSelection, setBrandSelection] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [enableIp, setEnableIp] = useState(true);
  const [enableMac, setEnableMac] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setBrandSelection('');
    setNewBrandName('');
    setModelName('');
    setEnableIp(true);
    setEnableMac(true);
    setError(null);
  };

  const loadBrands = useCallback(async () => {
    try {
      setBrandsLoading(true);
      const list = await inventoryService.getDeviceBrands();
      setBrands(list);
    } catch {
      setBrands([]);
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadBrands();
    }
  }, [isOpen, loadBrands]);

  const resolvedBrand = brandSelection === NEW_BRAND_VALUE ? newBrandName.trim() : brandSelection.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!brandSelection) {
      setError('Marka seçin veya yeni marka ekleyin');
      return;
    }
    if (!resolvedBrand) {
      setError('Marka adı zorunludur');
      return;
    }
    if (!modelName.trim()) {
      setError('Model adı zorunludur');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const created = await inventoryService.createDeviceModel({
        brand: resolvedBrand,
        name: modelName.trim(),
        enableIp,
        enableMac,
      });
      await onCreated(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Model oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed z-50 inset-0 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <button
          type="button"
          className="fixed inset-0 bg-gray-500/75 transition-opacity"
          aria-label="Kapat"
          onClick={onClose}
        />
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden>
          &#8203;
        </span>
        <div className="relative inline-block w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900">Yeni cihaz modeli</h3>
              <p className="mt-1 text-sm text-gray-500">Önce marka, ardından model bilgisini girin.</p>

              {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className={`${formGrid} mt-4`}>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marka *</label>
                  <select
                    className={formSelect}
                    value={brandSelection}
                    onChange={(e) => {
                      setBrandSelection(e.target.value);
                      if (e.target.value !== NEW_BRAND_VALUE) {
                        setNewBrandName('');
                      }
                    }}
                    disabled={brandsLoading || submitting}
                    required
                  >
                    <option value="">Marka seçin</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                    <option value={NEW_BRAND_VALUE}>+ Yeni marka ekle</option>
                  </select>
                </div>

                {brandSelection === NEW_BRAND_VALUE && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni marka adı *</label>
                    <input
                      className={formInput}
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="Örn. HP, Dell, Lenovo"
                      disabled={submitting}
                      autoFocus
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input
                    className={formInput}
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Örn. EliteBook 840 G9"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableIp}
                      onChange={(e) => setEnableIp(e.target.checked)}
                      disabled={submitting}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                    />
                    IP adresi alanı
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableMac}
                      onChange={(e) => setEnableMac(e.target.checked)}
                      disabled={submitting}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                    />
                    MAC adresi alanı
                  </label>
                </div>

                {resolvedBrand && modelName.trim() && (
                  <div className="sm:col-span-2 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700">
                    Önizleme: <span className="font-medium">{resolvedBrand} — {modelName.trim()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Kaydediliyor…' : 'Modeli kaydet'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
