import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DeviceModel, inventoryService } from '../../services/inventory.service';
import { SearchableOptionSelect } from '../common/SearchableOptionSelect';
import { formGrid, formInput } from '../common/formStyles';

const NEW_BRAND_VALUE = '__new__';
const NEW_MODEL_VALUE = '__new_model__';

interface EditDeviceModelModalProps {
  isOpen: boolean;
  model: DeviceModel | null;
  onClose: () => void;
  onUpdated: (model: DeviceModel) => void | Promise<void>;
}

export const EditDeviceModelModal = ({ isOpen, model, onClose, onUpdated }: EditDeviceModelModalProps) => {
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
    if (!isOpen || !model) return;

    const brand = model.brand?.trim() ?? '';
    const name = model.name?.trim() ?? '';
    setEnableIp(model.enableIp ?? false);
    setEnableMac(model.enableMac ?? false);
    setError(null);
    setNewBrandName('');
    setNewModelName('');
    setBrandSelection(brand || null);
    setModelSelection(name || null);
    void loadOptions();
  }, [isOpen, model, loadOptions]);

  const brandOptions = useMemo(() => {
    const opts = brands.map((brand) => ({ value: brand, label: brand }));
    if (
      brandSelection &&
      brandSelection !== NEW_BRAND_VALUE &&
      !brands.includes(brandSelection)
    ) {
      opts.unshift({ value: brandSelection, label: brandSelection });
    }
    opts.push({ value: NEW_BRAND_VALUE, label: '+ Yeni marka ekle' });
    return opts;
  }, [brands, brandSelection]);

  const resolvedBrand =
    brandSelection === NEW_BRAND_VALUE ? newBrandName.trim() : (brandSelection?.trim() ?? '');

  const modelNameOptions = useMemo(() => {
    const brand = resolvedBrand;
    const names = [
      ...new Set(
        deviceModels
          .filter((m) => {
            if (!brand || brandSelection === NEW_BRAND_VALUE) return true;
            return (m.brand?.trim() ?? '') === brand;
          })
          .map((m) => m.name?.trim())
          .filter((n): n is string => !!n && n.length > 0)
      ),
    ].sort((a, b) => a.localeCompare(b, 'tr'));

    const opts = names.map((name) => ({ value: name, label: name }));
    if (
      modelSelection &&
      modelSelection !== NEW_MODEL_VALUE &&
      !names.includes(modelSelection)
    ) {
      opts.unshift({ value: modelSelection, label: modelSelection });
    }
    opts.push({ value: NEW_MODEL_VALUE, label: '+ Yeni model adı yaz' });
    return opts;
  }, [deviceModels, resolvedBrand, brandSelection, modelSelection]);

  const resolvedModelName =
    modelSelection === NEW_MODEL_VALUE ? newModelName.trim() : (modelSelection?.trim() ?? '');

  const handleBrandChange = (value: string | null) => {
    setBrandSelection(value);
    setError(null);
    if (value !== NEW_BRAND_VALUE) {
      setNewBrandName('');
    }
    // Marka değişince model seçimini sıfırla (aynı isim yeni markada da varsa koru)
    if (modelSelection && modelSelection !== NEW_MODEL_VALUE) {
      const stillExists = deviceModels.some(
        (m) =>
          m.name?.trim() === modelSelection &&
          (value === NEW_BRAND_VALUE || !value || (m.brand?.trim() ?? '') === value)
      );
      if (!stillExists && model?.name?.trim() !== modelSelection) {
        setModelSelection(null);
      }
    }
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
    if (!model) return;
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
      const updated = await inventoryService.updateDeviceModel(model.id, {
        brand: resolvedBrand,
        name: resolvedModelName,
        enableIp,
        enableMac,
      });
      await onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Model güncellenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !model) return null;

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
        <div className="relative inline-block w-full max-w-lg transform overflow-visible rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900">Marka / model düzenle</h3>
              <p className="mt-1 text-sm text-gray-500">
                Seçili cihaz modelinin marka ve model bilgisini güncelleyin.
              </p>

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
                    disabled={disabled}
                    placeholder={optionsLoading ? 'Modeller yükleniyor…' : 'Model ara veya seç…'}
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
                {submitting ? 'Kaydediliyor…' : 'Güncelle'}
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
