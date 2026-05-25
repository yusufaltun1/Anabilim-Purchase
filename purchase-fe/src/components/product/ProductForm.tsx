import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, FormSection, InputWithButton } from '../common/FormField';
import {
  btnInline,
  btnInlinePrimary,
  formGrid,
  formInput,
  formSelect,
  formTextarea,
} from '../common/formStyles';
import { SearchableCategorySelect } from '../common/SearchableCategorySelect';
import { SearchableSupplierSelect } from '../common/SearchableSupplierSelect';
import { categoryService } from '../../services/category.service';
import { inventoryService } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { schoolService } from '../../services/school.service';
import { supplierService } from '../../services/supplier.service';
import { Category, CATEGORY_PRODUCT_TYPE_OPTIONS } from '../../types/category';
import { CreateProductRequest, Product, ProductType, UpdateProductRequest } from '../../types/product';
import { School } from '../../types/school';
import { Supplier } from '../../types/supplier';
import { isAssetProductType, normalizeProductType } from '../../utils/productType';

type Mode = 'create' | 'edit';

interface ProductFormProps {
  mode: Mode;
  productId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyForm = (): CreateProductRequest => ({
  name: '',
  code: '',
  description: '',
  serialNumber: '',
  categoryId: null,
  productType: ProductType.CONSUMABLE,
  unitOfMeasure: 'PIECE',
  minQuantity: 1,
  maxQuantity: 100,
  estimatedUnitPrice: 0,
  currency: 'TRY',
  imageUrls: [],
  byod: false,
});

const toDateInput = (iso?: string) => (iso ? iso.substring(0, 10) : '');
const toDateTimePayload = (date?: string) => (date ? `${date}T00:00:00` : undefined);

const productTypeLabel = (type: string) =>
  CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === type)?.label || type || '—';

export const ProductForm = ({ mode, productId, onSuccess, onCancel }: ProductFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<CreateProductRequest>(emptyForm());
  const [active, setActive] = useState(true);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [deviceModels, setDeviceModels] = useState<{ id: number; name: string; enableIp?: boolean; enableMac?: boolean }[]>([]);
  const [conditions, setConditions] = useState<{ id: number; name: string }[]>([]);
  const [parentLocs, setParentLocs] = useState<{ id: number; name: string }[]>([]);
  const [childLocs, setChildLocs] = useState<{ id: number; name: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<{ enableIp?: boolean; enableMac?: boolean } | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId),
    [categories, form.categoryId]
  );

  const effectiveProductType = normalizeProductType(selectedCategory?.productType ?? form.productType);
  const showAssetFields = mode === 'create' || isAssetProductType(effectiveProductType);

  useEffect(() => {
    (async () => {
      await loadMasters();
      if (mode === 'edit' && productId) await loadProduct(productId);
    })();
  }, [mode, productId]);

  useEffect(() => {
    if (form.categoryId) {
      supplierService.getSuppliersByCategory(form.categoryId).then(setSuppliers).catch(() => setSuppliers([]));
    } else {
      supplierService.getActiveSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
    }
  }, [form.categoryId]);

  const loadMasters = async () => {
    try {
      const [catsRes, models, conds, parents, schoolList] = await Promise.all([
        categoryService.getActiveCategories(),
        inventoryService.getDeviceModels().catch(() => []),
        inventoryService.getAssetConditions().catch(() => []),
        inventoryService.getParentLocations().catch(() => []),
        schoolService.getActiveSchools().catch(() => []),
      ]);
      if (catsRes.success && catsRes.data) {
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : [catsRes.data]);
      } else {
        try {
          setCategories(await categoryService.getAllCategories());
        } catch {
          setError('Kategoriler yüklenemedi');
        }
      }
      setDeviceModels(models);
      setConditions(conds);
      setParentLocs(parents);
      setSchools(schoolList);
    } catch {
      setError('Form verileri yüklenirken hata oluştu');
    }
  };

  const loadProduct = async (id: number) => {
    try {
      setLoading(true);
      const p: Product = await productService.getProductById(id);
      setForm({
        name: p.name,
        code: p.code,
        description: p.description || '',
        serialNumber: p.serialNumber || '',
        categoryId: p.category?.id ?? null,
        productType: (p.productType as ProductType) || ProductType.CONSUMABLE,
        unitOfMeasure: 'PIECE',
        minQuantity: p.minQuantity ?? 1,
        maxQuantity: p.maxQuantity ?? 100,
        estimatedUnitPrice: p.estimatedUnitPrice ?? 0,
        currency: 'TRY',
        imageUrls: p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : []),
        assetLabel: p.assetLabel,
        domainName: p.domainName,
        deviceModelId: p.deviceModelId,
        assetConditionId: p.assetConditionId,
        defaultParentLocationId: p.defaultParentLocationId,
        defaultChildLocationId: p.defaultChildLocationId,
        ipAddress: p.ipAddress,
        macAddress: p.macAddress,
        notes: p.notes,
        schoolId: p.schoolId,
        orderNumber: p.orderNumber,
        byod: p.byod ?? false,
        warrantyMonths: p.warrantyMonths,
        lifespanEndDate: toDateInput(p.lifespanEndDate),
        purchaseDate: toDateInput(p.purchaseDate),
        purchasePrice: p.purchasePrice,
        warrantyExpiryDate: toDateInput(p.warrantyExpiryDate),
      });
      setActive(p.active ?? p.isActive ?? true);
      if (p.primarySupplierId) setSupplierId(p.primarySupplierId);
      else if (p.suppliers?.[0]?.id) setSupplierId(p.suppliers[0].id);
      if (p.deviceModelId) {
        const models = await inventoryService.getDeviceModels();
        setSelectedModel(models.find((x) => x.id === p.deviceModelId) || null);
      }
      if (p.defaultParentLocationId) {
        setChildLocs(await inventoryService.getChildLocations(p.defaultParentLocationId));
      }
    } catch {
      setError('Ürün yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const onCategoryChange = (cat: Category | null) => {
    setForm((prev) => ({
      ...prev,
      categoryId: cat?.id ?? null,
      productType: (cat?.productType as ProductType) || ProductType.FIXED_ASSET,
    }));
    setSupplierId(null);
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    const maxBytes = 8 * 1024 * 1024;
    Array.from(files).forEach((file) => {
      if (file.size > maxBytes) {
        setError('Dosya boyutu en fazla 8 MB olabilir');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setForm((prev) => ({ ...prev, imageUrls: [...(prev.imageUrls || []), url] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, i) => i !== index),
    }));
  };

  const buildPayload = () => ({
    ...form,
    imageUrl: form.imageUrls?.[0],
    supplierIds: supplierId ? [supplierId] : [],
    purchaseDate: toDateTimePayload(form.purchaseDate),
    lifespanEndDate: toDateTimePayload(form.lifespanEndDate),
    warrantyExpiryDate: toDateTimePayload(form.warrantyExpiryDate),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) {
      setError('Ad ve kategori zorunludur');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const payload = buildPayload();
      if (mode === 'create') {
        const res = await productService.createProduct(payload);
        if (!res.success) throw new Error(res.message);
      } else if (productId) {
        const res = await productService.updateProduct(productId, {
          ...payload,
          active,
          serialnumber: form.serialNumber,
        } as UpdateProductRequest);
        if (!res.success) throw new Error(res.message);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const generateAssetLabel = () => {
    setForm((prev) => ({ ...prev, assetLabel: `AST-${Date.now().toString(36).toUpperCase()}` }));
  };

  const createModel = async () => {
    const name = window.prompt('Model adı');
    if (!name) return;
    const created = await inventoryService.createDeviceModel({ name, enableIp: true, enableMac: true });
    setDeviceModels(await inventoryService.getDeviceModels());
    setForm({ ...form, deviceModelId: created.id });
    setSelectedModel(created);
  };

  const createCondition = async () => {
    const name = window.prompt('Durum adı');
    if (!name) return;
    const allows = window.confirm('Dağıtılabilir mi?');
    const created = await inventoryService.createAssetCondition({ name, allowsAssignment: allows });
    setConditions(await inventoryService.getAssetConditions());
    setForm({ ...form, assetConditionId: created.id });
  };

  const createLocation = async () => {
    const name = window.prompt('Konum adı');
    if (!name) return;
    await inventoryService.createLocation({ name, parentId: form.defaultParentLocationId ?? undefined });
    if (form.defaultParentLocationId) {
      setChildLocs(await inventoryService.getChildLocations(form.defaultParentLocationId));
    } else {
      setParentLocs(await inventoryService.getParentLocations());
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <FormSection title="Genel bilgiler" description="Ürün tanımı ve kategori">
        <div className={formGrid}>
          <FormField label="Ürün adı" required>
            <input
              className={formInput}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Ürün kodu (iç SKU)" hint="Boş bırakılırsa otomatik oluşturulur">
            <input
              className={`${formInput} uppercase`}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="Otomatik"
            />
          </FormField>
          <FormField label="Kategori" required className="sm:col-span-2">
            <SearchableCategorySelect
              categories={categories}
              value={form.categoryId}
              onChange={onCategoryChange}
              required
            />
          </FormField>
          <FormField label="Ürün tipi">
            <input readOnly className={`${formInput} bg-gray-50 text-gray-600`} value={productTypeLabel(effectiveProductType)} />
          </FormField>
          {mode === 'edit' && (
            <FormField label="Durum kaydı">
              <label className="inline-flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Aktif ürün</span>
              </label>
            </FormField>
          )}
        </div>
        {mode === 'create' && !form.categoryId && (
          <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
            Kayıt için kategori seçin. Demirbaş alanları aşağıda doldurulabilir.
          </p>
        )}
      </FormSection>

      {showAssetFields && (
        <>
          <FormSection title="Demirbaş bilgileri" description="Cihaz kimliği, model ve konum">
            <div className={formGrid}>
              <FormField label="Şirket">
                <select
                  className={formSelect}
                  value={form.schoolId ?? ''}
                  onChange={(e) => setForm({ ...form, schoolId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Firma seç</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Demirbaş etiketi">
                <InputWithButton
                  button={
                    <button type="button" className={btnInline} onClick={generateAssetLabel} title="Etiket üret">
                      +
                    </button>
                  }
                >
                  <input
                    className={formInput}
                    value={form.assetLabel || ''}
                    onChange={(e) => setForm({ ...form, assetLabel: e.target.value })}
                  />
                </InputWithButton>
              </FormField>

              <FormField label="Seri no">
                <input
                  className={formInput}
                  value={form.serialNumber || ''}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                />
              </FormField>

              <FormField label="Model">
                <InputWithButton
                  button={
                    <button type="button" className={btnInlinePrimary} onClick={createModel}>
                      Yeni
                    </button>
                  }
                >
                  <select
                    className={formSelect}
                    value={form.deviceModelId ?? ''}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      setSelectedModel(deviceModels.find((x) => x.id === id) || null);
                      setForm({ ...form, deviceModelId: id });
                    }}
                  >
                    <option value="">Model seç</option>
                    {deviceModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </InputWithButton>
              </FormField>

              <FormField label="Durum">
                <InputWithButton
                  button={
                    <button type="button" className={btnInlinePrimary} onClick={createCondition}>
                      Yeni
                    </button>
                  }
                >
                  <select
                    className={formSelect}
                    value={form.assetConditionId ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, assetConditionId: e.target.value ? Number(e.target.value) : null })
                    }
                  >
                    <option value="">Durum seç</option>
                    {conditions.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </InputWithButton>
              </FormField>

              {selectedModel?.enableIp && (
                <FormField label="IP adresi">
                  <input
                    className={formInput}
                    value={form.ipAddress || ''}
                    onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                  />
                </FormField>
              )}

              {selectedModel?.enableMac && (
                <FormField label="MAC adresi">
                  <input
                    className={formInput}
                    value={form.macAddress || ''}
                    onChange={(e) => setForm({ ...form, macAddress: e.target.value })}
                  />
                </FormField>
              )}

              <FormField label="Notlar" className="sm:col-span-2">
                <textarea
                  className={formTextarea}
                  rows={3}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ek açıklamalar…"
                />
              </FormField>

              <FormField label="Varsayılan konum (üst)">
                <select
                  className={formSelect}
                  value={form.defaultParentLocationId ?? ''}
                  onChange={async (e) => {
                    const pid = e.target.value ? Number(e.target.value) : null;
                    setForm({ ...form, defaultParentLocationId: pid, defaultChildLocationId: null });
                    setChildLocs(pid ? await inventoryService.getChildLocations(pid) : []);
                  }}
                >
                  <option value="">Konum seç</option>
                  {parentLocs.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Alt konum">
                <InputWithButton
                  button={
                    <button type="button" className={btnInlinePrimary} onClick={createLocation}>
                      Yeni
                    </button>
                  }
                >
                  <select
                    className={formSelect}
                    value={form.defaultChildLocationId ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        defaultChildLocationId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    disabled={!form.defaultParentLocationId}
                  >
                    <option value="">Seçin</option>
                    {childLocs.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </InputWithButton>
              </FormField>

              <div className="sm:col-span-2 flex items-center rounded-md border border-gray-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedCategory?.requestable ?? false}
                  disabled
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Talep edilebilir
                  <span className="text-gray-500"> — kategori ayarından gelir</span>
                </span>
              </div>
            </div>
          </FormSection>

          <FormSection title="Opsiyonel bilgi">
            <div className={formGrid}>
              <FormField label="Demirbaş adı" className="sm:col-span-2" hint="Cihaz veya domain adı">
                <input
                  className={formInput}
                  value={form.domainName || ''}
                  onChange={(e) => setForm({ ...form, domainName: e.target.value })}
                  placeholder="ör. laptop-ahmet"
                />
              </FormField>
              <FormField label="Garanti süresi">
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="number"
                    min={0}
                    className={`${formInput} rounded-r-none`}
                    value={form.warrantyMonths ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, warrantyMonths: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                    ay
                  </span>
                </div>
              </FormField>
              <div className="sm:col-span-2 flex items-center rounded-md border border-gray-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  id="byod"
                  checked={form.byod ?? false}
                  onChange={(e) => setForm({ ...form, byod: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="byod" className="ml-3 text-sm cursor-pointer">
                  <span className="font-medium text-gray-900">BYOD</span>
                  <span className="block text-xs text-gray-500">Kullanıcıya ait cihaz</span>
                </label>
              </div>
            </div>
          </FormSection>

          <FormSection title="Sipariş bilgileri" description="Satın alma ve tedarikçi">
            <div className={formGrid}>
              <FormField label="Sipariş numarası">
                <input
                  className={formInput}
                  value={form.orderNumber || ''}
                  onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                />
              </FormField>
              <FormField label="Satın alma tarihi">
                <input
                  type="date"
                  className={formInput}
                  value={form.purchaseDate || ''}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                />
              </FormField>
              <FormField label="Ömür (bitiş)">
                <input
                  type="date"
                  className={formInput}
                  value={form.lifespanEndDate || ''}
                  onChange={(e) => setForm({ ...form, lifespanEndDate: e.target.value })}
                />
              </FormField>
              <FormField label="Tedarikçi">
                <InputWithButton
                  button={
                    <button type="button" className={btnInlinePrimary} onClick={() => navigate('/suppliers/create')}>
                      Yeni
                    </button>
                  }
                >
                  <SearchableSupplierSelect
                    suppliers={suppliers}
                    value={supplierId}
                    onChange={(s) => setSupplierId(s?.id ?? null)}
                  />
                </InputWithButton>
              </FormField>
              <FormField label="Satın alma ücreti">
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${formInput} rounded-r-none`}
                    value={form.purchasePrice ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, purchasePrice: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                    TRY
                  </span>
                </div>
              </FormField>
            </div>
          </FormSection>
        </>
      )}

      <FormSection title="Görseller">
        <FormField label="Dosya yükle" hint="jpg, webp, png, gif, svg — en fazla 8 MB">
          <input
            type="file"
            accept=".jpg,.jpeg,.webp,.png,.gif,.svg,image/*"
            multiple
            onChange={(e) => handleImages(e.target.files)}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </FormField>
        {(form.imageUrls?.length ?? 0) > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {form.imageUrls!.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />
                <button
                  type="button"
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600"
                  onClick={() => removeImage(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
};
