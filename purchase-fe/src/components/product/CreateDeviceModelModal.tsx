import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DeviceModel, inventoryService } from '../../services/inventory.service';
import { SearchableOptionSelect } from '../common/SearchableOptionSelect';
import { formGrid, formInput } from '../common/formStyles';

const NEW_BRAND_VALUE = '__new__';
const NEW_MODEL_VALUE = '__new_model__';

interface CreateDeviceModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (model: DeviceModel) => void | Promise<void>;
}

export const CreateDeviceModelModal = ({ isOpen, onClose, onCreated }: CreateDeviceModelModalProps) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [brandSelection, setBrandSelection] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [modelSelection, setModelSelection] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [enableIp, setEnableIp] = useState(true);
  const [enableMac, setEnableMac] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setBrandSelection(null);
    setNewBrandName('');
    setModelSelection(null);
    setNewModelName('');
    setEnableIp(true);
    setEnableMac(true);
    setError(null);
  };

  const loadOptions = useCallback(async () => {
    try {
      setOptionsLoading(true);
      const [brandList, models] = await Promise.all([
        inventoryService.getDeviceBrands().catch(() => [] as string[]),
        inventoryService.getDeviceModels().catch(() => [] as DeviceModel[]),
      ]);
      setBrands(brandList);
      setDeviceModels(models);
    } catch {
      setBrands([]);
      setDeviceModels([]);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      void loadOptions();
    }
  }, [isOpen, loadOptions]);

  const brandOptions = useMemo(
    () => [
      ...brands.map((brand) => ({ value: brand, label: brand })),
      { value: NEW_BRAND_VALUE, label: '+ Yeni marka ekle' },
    ],
    [brands]
  );

  const resolvedBrand =
    brandSelection === NEW_BRAND_VALUE ? newBrandName.trim() : (brandSelection?.trim() ?? '');

  const modelNameOptions = useMemo(() => {
    const brand = resolvedBrand;
    const names = [
      ...new Set(
        deviceModels
          .filter((m) => {
            if (!brand || brandSelection === NEW_BRAND_VALUE) return false;
            return (m.brand?.trim() ?? '') === brand;
          })
          .map((m) => m.name?.trim())
          .filter((n): n is string => !!n && n.length > 0)
      ),
    ].sort((a, b) => a.localeCompare(b, 'tr'));

    return [
      ...names.map((name) => ({ value: name, label: name })),
      { value: NEW_MODEL_VALUE, label: '+ Yeni model adı yaz' },
    ];
  }, [deviceModels, resolvedBrand, brandSelection]);

  const resolvedModelName =
    modelSelection === NEW_MODEL_VALUE ? newModelName.trim() : (modelSelection?.trim() ?? '');

  const handleBrandChange = (value: string | null) => {
    setBrandSelection(value);
    setError(null);
    if (value !== NEW_BRAND_VALUE) {
      setNewBrandName('');
    }
    setModelSelection(null);
    setNewModelName('');
  };

  const handleModelChange = (value: string | null) => {
    setModelSelection(value);
    setError(null);
    if (value !== NEW_MODEL_VALUE) {
      setNewModelName('');
    }
  };

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
    if (!modelSelection) {
      setError('Model seçin veya yeni model adı yazın');
      return;
    }
    if (!resolvedModelName) {
      setError('Model adı zorunludur');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const created = await inventoryService.createDeviceModel({
        brand: resolvedBrand,
        name: resolvedModelName,
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

  const disabled = optionsLoading || submitting;

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
                  <SearchableOptionSelect
                    options={brandOptions}
                    value={brandSelection}
                    onChange={handleBrandChange}
                    disabled={disabled}
                    placeholder={optionsLoading ? 'Markalar yükleniyor…' : 'Marka ara veya seç…'}
                    allowClear
                  />
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
                  <SearchableOptionSelect
                    options={modelNameOptions}
                    value={modelSelection}
                    onChange={handleModelChange}
                    disabled={disabled || !brandSelection}
                    placeholder={
                      !brandSelection
                        ? 'Önce marka seçin'
                        : optionsLoading
                          ? 'Modeller yükleniyor…'
                          : 'Model ara veya seç…'
                    }
                    allowClear
                  />
                </div>

                {modelSelection === NEW_MODEL_VALUE && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni model adı *</label>
                    <input
                      className={formInput}
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      placeholder="Örn. EliteBook 840 G9"
                      disabled={submitting}
                      autoFocus
                    />
                  </div>
                )}

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

                {resolvedBrand && resolvedModelName && (
                  <div className="sm:col-span-2 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700">
                    Önizleme:{' '}
                    <span className="font-medium">
                      {resolvedBrand} — {resolvedModelName}
                    </span>
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
