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
import { UnitOfMeasureLabels, getLabelToUnit } from '../../types/enums';
import { PRODUCT_FIELD_LABELS } from '../../utils/apiErrors';
import { resolveProductType } from '../../utils/productType';

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

const fieldError = (fieldErrors: Record<string, string>, ...keys: string[]) => {
  for (const key of keys) {
    if (fieldErrors[key]) return fieldErrors[key];
  }
  return undefined;
};

export const ProductForm = ({ mode, productId, onSuccess, onCancel }: ProductFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  const effectiveProductType = resolveProductType(selectedCategory?.productType ?? form.productType);

  useEffect(() => {
    (async () => {
      const cats = await loadMasters();
      if (mode === 'edit' && productId) await loadProduct(productId, cats);
    })();
  }, [mode, productId]);

  useEffect(() => {
    if (form.categoryId) {
      supplierService.getSuppliersByCategory(form.categoryId).then(setSuppliers).catch(() => setSuppliers([]));
    } else {
      supplierService.getActiveSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
    }
  }, [form.categoryId]);

  const loadMasters = async (): Promise<Category[]> => {
    try {
      const [catsRes, models, conds, parents, schoolList] = await Promise.all([
        categoryService.getActiveCategories(),
        inventoryService.getDeviceModels().catch(() => []),
        inventoryService.getAssetConditions().catch(() => []),
        inventoryService.getParentLocations().catch(() => []),
        schoolService.getActiveSchools().catch(() => []),
      ]);
      let loadedCategories: Category[] = [];
      if (catsRes.success && catsRes.data) {
        loadedCategories = Array.isArray(catsRes.data) ? catsRes.data : [catsRes.data];
        setCategories(loadedCategories);
      } else {
        try {
          loadedCategories = await categoryService.getAllCategories();
          setCategories(loadedCategories);
        } catch {
          setError('Kategoriler yüklenemedi');
        }
      }
      setDeviceModels(models);
      setConditions(conds);
      setParentLocs(parents);
      setSchools(schoolList);
      return loadedCategories;
    } catch {
      setError('Form verileri yüklenirken hata oluştu');
      return [];
    }
  };

  const loadProduct = async (id: number, categoriesList: Category[]) => {
    try {
      setLoading(true);
      const p: Product = await productService.getProductById(id);
      const categoryId = p.category?.id ?? null;
      const matchedCategory = categoriesList.find((c) => c.id === categoryId);
      const resolvedType = resolveProductType(matchedCategory?.productType ?? p.productType);
      setForm({
        name: p.name,
        code: p.code,
        description: p.description || '',
        serialNumber: p.serialNumber || '',
        categoryId,
        productType: (resolvedType || ProductType.CONSUMABLE) as ProductType,
        unitOfMeasure: getLabelToUnit(p.unitOfMeasure || (p as Product & { unit?: string }).unit || 'PIECE'),
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
    const resolved = resolveProductType(cat?.productType);
    setForm((prev) => ({
      ...prev,
      categoryId: cat?.id ?? null,
      productType: (resolved || ProductType.CONSUMABLE) as ProductType,
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
    productType: (resolveProductType(selectedCategory?.productType ?? form.productType) ||
      form.productType) as ProductType,
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
      setFieldErrors({});
      const payload = buildPayload();
      const handleFailure = (res: { message: string; fieldErrors?: Record<string, string> }) => {
        const errors = res.fieldErrors ?? {};
        setFieldErrors(errors);
        setError(res.message);
      };
      if (mode === 'create') {
        const res = await productService.createProduct(payload);
        if (!res.success) {
          handleFailure(res);
          return;
        }
      } else if (productId) {
        const serial = form.serialNumber?.trim();
        const res = await productService.updateProduct(productId, {
          ...payload,
          active,
          ...(serial ? { serialnumber: serial } : {}),
        } as UpdateProductRequest);
        if (!res.success) {
          handleFailure(res);
          return;
        }
      }
      onSuccess();
    } catch (err: unknown) {
      setFieldErrors({});
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
      {(error || Object.keys(fieldErrors).length > 0) && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error && <p className="font-medium">{error}</p>}
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {Object.entries(fieldErrors).map(([field, msg]) => (
                <li key={field}>
                  <span className="font-medium">{PRODUCT_FIELD_LABELS[field] || field}:</span> {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <FormSection title="Genel bilgiler" description="Ürün tanımı ve kategori">
        <div className={formGrid}>
          <FormField label="Ürün adı" required error={fieldError(fieldErrors, 'name')}>
            <input
              className={`${formInput}${fieldError(fieldErrors, 'name') ? ' border-red-500' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Ürün kodu (iç SKU)" hint="Boş bırakılırsa otomatik oluşturulur" error={fieldError(fieldErrors, 'code')}>
            <input
              className={`${formInput} uppercase`}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="Otomatik"
            />
          </FormField>
          <FormField label="Kategori" required className="sm:col-span-2" error={fieldError(fieldErrors, 'categoryId')}>
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

      <FormSection title="Stok ve fiyat" description="Miktar limitleri ve tahmini birim fiyat">
        <div className={formGrid}>
          <FormField label="Açıklama" className="sm:col-span-2" error={fieldError(fieldErrors, 'description')}>
            <textarea
              className={formTextarea}
              rows={3}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ürün açıklaması"
            />
          </FormField>
          <FormField label="Ölçü birimi" error={fieldError(fieldErrors, 'unitOfMeasure')}>
            <select
              className={formSelect}
              value={form.unitOfMeasure}
              onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value })}
            >
              {Object.entries(UnitOfMeasureLabels).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Min. miktar" error={fieldError(fieldErrors, 'minQuantity')}>
            <input
              type="number"
              min={0}
              className={formInput}
              value={form.minQuantity}
              onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Max. miktar" error={fieldError(fieldErrors, 'maxQuantity')}>
            <input
              type="number"
              min={0}
              className={formInput}
              value={form.maxQuantity}
              onChange={(e) => setForm({ ...form, maxQuantity: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Tahmini birim fiyat" error={fieldError(fieldErrors, 'estimatedUnitPrice')}>
            <div className="flex rounded-md shadow-sm">
              <input
                type="number"
                min={0}
                step="0.01"
                className={`${formInput} rounded-r-none`}
                value={form.estimatedUnitPrice}
                onChange={(e) => setForm({ ...form, estimatedUnitPrice: Number(e.target.value) })}
              />
              <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                {form.currency || 'TRY'}
              </span>
            </div>
          </FormField>
          <FormField label="Para birimi" error={fieldError(fieldErrors, 'currency')}>
            <select
              className={formSelect}
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </FormField>
        </div>
      </FormSection>

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

              <FormField
                label="Seri no"
                error={fieldError(fieldErrors, 'serialNumber', 'serialnumber')}
              >
                <input
                  className={`${formInput}${fieldError(fieldErrors, 'serialNumber', 'serialnumber') ? ' border-red-500' : ''}`}
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

              <FormField label="Durum" hint="Zimmet için 'Hazır' ve dağıtılabilir durum seçin">
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
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.allowsAssignment === false ? ' (zimmet yok)' : ''}
                      </option>
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
