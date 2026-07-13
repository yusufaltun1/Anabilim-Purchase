import { useEffect, useMemo, useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
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
import { SearchableDeviceModelSelect } from '../common/SearchableDeviceModelSelect';
import { SearchableSupplierSelect } from '../common/SearchableSupplierSelect';
import { categoryService } from '../../services/category.service';
import { AssetCondition, DeviceModel, inventoryService } from '../../services/inventory.service';
import { CreateDeviceModelModal } from './CreateDeviceModelModal';
import { CreateSupplierModal } from './CreateSupplierModal';
import { EditDeviceModelModal } from './EditDeviceModelModal';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import {
  emptyProductAssignmentState,
  ProductCreateAssignmentSection,
  ProductCreateAssignmentState,
  resolveAssignmentLocationId,
} from './ProductCreateAssignmentSection';
import { assignmentService } from '../../services/assignment.service';
import { userService } from '../../services/user.service';
import { User } from '../../types/user';
import { LocationHierarchyPickers } from '../common/LocationHierarchyPickers';
import { locationService } from '../../services/location.service';
import {
  resolveProductLocationLevels,
  resolveProductLocationPayload,
} from '../../utils/locationHierarchy';
import { productService } from '../../services/product.service';
import { schoolService } from '../../services/school.service';
import { supplierService } from '../../services/supplier.service';
import { warehouseService } from '../../services/warehouse.service';
import { Category, CATEGORY_PRODUCT_TYPE_OPTIONS } from '../../types/category';
import { CreateProductRequest, Product, ProductType, UpdateProductRequest } from '../../types/product';
import { School } from '../../types/school';
import { Supplier } from '../../types/supplier';
import { Warehouse } from '../../types/warehouse';
import { getUnitToLabel } from '../../types/enums';
import { resolveCategoryStockSettings } from '../../utils/categoryStockDefaults';
import { PRODUCT_FIELD_LABELS } from '../../utils/apiErrors';
import { isAssetProductType, resolveProductType } from '../../utils/productType';

type Mode = 'create' | 'edit';

interface ProductFormProps {
  mode: Mode;
  productId?: number;
  cloneFromId?: number;
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

export const ProductForm = ({ mode, productId, cloneFromId, onSuccess, onCancel }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(Boolean(productId || cloneFromId));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<CreateProductRequest>(emptyForm());
  const [active, setActive] = useState(true);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [showDeviceModelModal, setShowDeviceModelModal] = useState(false);
  const [showEditDeviceModelModal, setShowEditDeviceModelModal] = useState(false);
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [conditions, setConditions] = useState<AssetCondition[]>([]);
  const [locationRootId, setLocationRootId] = useState<number | null>(null);
  const [locationMiddleId, setLocationMiddleId] = useState<number | null>(null);
  const [locationLeafId, setLocationLeafId] = useState<number | null>(null);
  const [locationReloadToken, setLocationReloadToken] = useState(0);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [assignmentState, setAssignmentState] = useState<ProductCreateAssignmentState>(
    emptyProductAssignmentState()
  );
  const [users, setUsers] = useState<User[]>([]);

  const applyDeviceModelSelection = (model: DeviceModel | null) => {
    setSelectedModel(model);
    setForm((prev) => ({ ...prev, deviceModelId: model?.id ?? null }));
  };

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId),
    [categories, form.categoryId]
  );

  const effectiveProductType = resolveProductType(selectedCategory?.productType ?? form.productType);
  const assetFieldsRequired = mode === 'create' && isAssetProductType(effectiveProductType);

  const isDepotSelected = form.warehouseId != null;
  const showCreateAssignment = mode === 'create' && assetFieldsRequired && !isDepotSelected;
  const showDefaultLocationPickers = mode === 'edit';

  useEffect(() => {
    (async () => {
      const cats = await loadMasters();
      if (mode === 'edit' && productId) {
        await applyProductToForm(productId, cats);
      } else if (mode === 'create' && cloneFromId) {
        await applyProductToForm(cloneFromId, cats, { clone: true });
      }
    })();
  }, [mode, productId, cloneFromId]);

  useEffect(() => {
    if (form.categoryId) {
      supplierService.getSuppliersByCategory(form.categoryId).then(setSuppliers).catch(() => setSuppliers([]));
    } else {
      supplierService.getActiveSuppliers().then(setSuppliers).catch(() => setSuppliers([]));
    }
  }, [form.categoryId]);

  const loadMasters = async (): Promise<Category[]> => {
    try {
      const [catsRes, models, conds, schoolList, warehouseList] = await Promise.all([
        categoryService.getActiveCategories(),
        inventoryService.getDeviceModels().catch(() => []),
        inventoryService.getAssetConditions().catch(() => []),
        schoolService.getActiveSchools().catch(() => []),
        warehouseService.getActiveWarehouses().catch(() => []),
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
      setSchools(schoolList);
      setWarehouses(warehouseList);
      if (mode === 'create') {
        userService.getAllUsers().then(setUsers).catch(() => setUsers([]));
      }
      return loadedCategories;
    } catch {
      setError('Form verileri yüklenirken hata oluştu');
      return [];
    }
  };

  const applyProductToForm = async (
    id: number,
    categoriesList: Category[],
    options?: { clone?: boolean }
  ) => {
    try {
      setLoading(true);
      const p: Product = await productService.getProductById(id);
      const categoryId = p.category?.id ?? null;
      const matchedCategory = categoriesList.find((c) => c.id === categoryId);
      const resolvedType = resolveProductType(matchedCategory?.productType ?? p.productType);
      const stock = resolveCategoryStockSettings(matchedCategory);
      const cloneSuffix = ' (Kopya)';

      setForm({
        name: options?.clone
          ? p.name.endsWith(cloneSuffix)
            ? p.name
            : `${p.name}${cloneSuffix}`
          : p.name,
        code: options?.clone ? '' : p.code,
        description: p.description || '',
        serialNumber: options?.clone ? '' : p.serialNumber || '',
        categoryId,
        productType: (resolvedType || ProductType.CONSUMABLE) as ProductType,
        unitOfMeasure: stock.unitOfMeasure,
        minQuantity: stock.minQuantity,
        maxQuantity: stock.maxQuantity,
        estimatedUnitPrice: p.estimatedUnitPrice ?? 0,
        currency: stock.currency,
        imageUrls: p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : []),
        assetLabel: options?.clone ? '' : p.code || p.assetLabel || '',
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
        purchaseDate: toDateInput(p.purchaseDate),
        purchasePrice: p.purchasePrice,
        warrantyExpiryDate: toDateInput(p.warrantyExpiryDate ?? p.lifespanEndDate),
      });
      setActive(options?.clone ? true : (p.active ?? p.isActive ?? true));
      if (p.primarySupplierId) setSupplierId(p.primarySupplierId);
      else if (p.suppliers?.[0]?.id) setSupplierId(p.suppliers[0].id);
      if (p.deviceModelId) {
        const models = await inventoryService.getDeviceModels();
        const model = models.find((x) => x.id === p.deviceModelId) || null;
        applyDeviceModelSelection(model);
        setDeviceModels(models);
      }
      const locRes = await locationService.getAllLocations();
      if (locRes.success && Array.isArray(locRes.data)) {
        const levels = resolveProductLocationLevels(
          locRes.data,
          p.defaultParentLocationId ?? null,
          p.defaultChildLocationId ?? null
        );
        setLocationRootId(levels.rootId);
        setLocationMiddleId(levels.middleId);
        setLocationLeafId(levels.leafId);
      }
    } catch {
      setError(options?.clone ? 'Klonlanacak ürün yüklenemedi' : 'Ürün yüklenemedi');
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const categoryStock = useMemo(
    () => resolveCategoryStockSettings(selectedCategory),
    [selectedCategory]
  );

  const onCategoryChange = (cat: Category | null) => {
    const resolved = resolveProductType(cat?.productType);
    const stock = resolveCategoryStockSettings(cat);
    setForm((prev) => ({
      ...prev,
      categoryId: cat?.id ?? null,
      productType: (resolved || ProductType.CONSUMABLE) as ProductType,
      unitOfMeasure: stock.unitOfMeasure,
      minQuantity: stock.minQuantity,
      maxQuantity: stock.maxQuantity,
      currency: stock.currency,
    }));
    setSupplierId(null);
  };

  const addImageDataUrl = (url: string) => {
    const base64 = url.includes(',') ? url.split(',')[1] : '';
    const approxBytes = base64 ? (base64.length * 3) / 4 : 0;
    const maxBytes = 8 * 1024 * 1024;
    if (approxBytes > maxBytes) {
      setError('Dosya boyutu en fazla 8 MB olabilir');
      return;
    }
    setForm((prev) => ({ ...prev, imageUrls: [...(prev.imageUrls || []), url] }));
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
        addImageDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = (dataUrl: string) => {
    addImageDataUrl(dataUrl);
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, i) => i !== index),
    }));
  };

  const buildPayload = () => {
    const code = form.code.trim().toUpperCase();
    const warehouseId = isDepotSelected ? form.warehouseId : null;

    let locationFields: {
      defaultParentLocationId?: number | null;
      defaultChildLocationId?: number | null;
    } = {};

    if (mode === 'edit') {
      locationFields = resolveProductLocationPayload(locationRootId, locationMiddleId, locationLeafId);
    } else if (!isDepotSelected) {
      if (assignmentState.assignmentType === 'location') {
        locationFields = resolveProductLocationPayload(
          assignmentState.assignedLocationRootId,
          assignmentState.assignedLocationMiddleId,
          assignmentState.assignedLocationLeafId
        );
      } else if (assignmentState.assignedUserId) {
        const user = users.find((u) => u.id?.toString() === assignmentState.assignedUserId);
        locationFields = {
          defaultParentLocationId: user?.workLocationParentId ?? null,
          defaultChildLocationId: user?.workLocationChildId ?? null,
        };
      }
    }

    return {
      ...form,
      ...locationFields,
      warehouseId,
      code,
      assetLabel: code,
      productType: (resolveProductType(selectedCategory?.productType ?? form.productType) ||
        form.productType) as ProductType,
      imageUrl: form.imageUrls?.[0],
      supplierIds: supplierId ? [supplierId] : [],
      purchaseDate: toDateTimePayload(form.purchaseDate),
      warrantyExpiryDate: toDateTimePayload(form.warrantyExpiryDate),
    };
  };

  const validateAssignmentFields = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!showCreateAssignment) {
      return errors;
    }
    if (assignmentState.assignmentType === 'user') {
      if (!assignmentState.assignedUserId) {
        errors.assignedUserId = 'Zimmet için kullanıcı seçin';
      }
    } else if (!resolveAssignmentLocationId(assignmentState)) {
      errors.assignedLocationId = 'Zimmet için konum seçin';
    }
    return errors;
  };

  const validateAssetFields = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) {
      errors.code = 'Demirbaş etiketi için ürün kodu zorunludur';
    }
    if (!form.serialNumber?.trim()) {
      errors.serialNumber = 'Seri no zorunludur';
    }
    if (!form.deviceModelId) {
      errors.deviceModelId = 'Model seçimi zorunludur';
    }
    if (showDefaultLocationPickers && !locationRootId) {
      errors.defaultParentLocationId = 'Konum seçimi zorunludur';
    }
    return errors;
  };

  const createAssignmentAfterProduct = async (productId: number, stockItemId: number) => {
    const assignedLocationId = resolveAssignmentLocationId(assignmentState);
    const result = await assignmentService.createAssignment({
      productId,
      stockItemId,
      expectedReturnDate: assignmentState.expectedReturnDate || undefined,
      notes: assignmentState.notes.trim() || undefined,
      ...(assignmentState.assignmentType === 'user'
        ? {
            assignedUserId: parseInt(assignmentState.assignedUserId, 10),
            assignedSchoolId: assignmentState.assignedSchoolId
              ? parseInt(assignmentState.assignedSchoolId, 10)
              : undefined,
          }
        : {
            assignedLocationId: assignedLocationId!,
            locationDetails: assignmentState.locationDetails.trim() || undefined,
          }),
    });

    const created = result.data && !Array.isArray(result.data) ? result.data : null;
    if (!created?.id) {
      return;
    }

    if (assignmentState.formPhotoFile) {
      await assignmentService.uploadFormPhoto(created.id, assignmentState.formPhotoFile);
    }
    await assignmentService.downloadAssignmentForm(created.id);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) {
      setError('Ad ve kategori zorunludur');
      return;
    }
    if (!form.code.trim()) {
      setError('Ürün kodu (iç SKU) zorunludur');
      return;
    }
    if (assetFieldsRequired) {
      const assetErrors = validateAssetFields();
      const assignmentErrors = validateAssignmentFields();
      const mergedErrors = { ...assetErrors, ...assignmentErrors };
      if (Object.keys(mergedErrors).length > 0) {
        setFieldErrors(mergedErrors);
        setError(
          showCreateAssignment
            ? 'Lütfen zorunlu demirbaş ve zimmet alanlarını doldurun'
            : 'Lütfen zorunlu demirbaş alanlarını doldurun'
        );
        return;
      }
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
        if (showCreateAssignment && res.data) {
          const createdProduct = Array.isArray(res.data) ? null : res.data;
          const stockItemId = createdProduct?.stockItemId;
          if (!createdProduct?.id) {
            setError('Ürün oluşturuldu ancak zimmet için ürün kaydı okunamadı');
            return;
          }
          if (!stockItemId) {
            setError('Ürün oluşturuldu ancak zimmet için cihaz kaydı bulunamadı');
            return;
          }
          try {
            await createAssignmentAfterProduct(createdProduct.id, stockItemId);
          } catch (assignmentErr: unknown) {
            setError(
              assignmentErr instanceof Error
                ? `Ürün oluşturuldu ancak zimmet kaydı tamamlanamadı: ${assignmentErr.message}`
                : 'Ürün oluşturuldu ancak zimmet kaydı tamamlanamadı'
            );
            return;
          }
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

  const handleCodeChange = (raw: string) => {
    const code = raw.toUpperCase();
    setForm((prev) => ({ ...prev, code, assetLabel: code }));
  };

  const handleDeviceModelUpdated = async (updated: DeviceModel) => {
    setDeviceModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    applyDeviceModelSelection(updated);
  };

  const reloadSuppliers = async () => {
    if (form.categoryId) {
      const list = await supplierService.getSuppliersByCategory(form.categoryId).catch(() => []);
      setSuppliers(list);
      return list;
    }
    const list = await supplierService.getActiveSuppliers().catch(() => []);
    setSuppliers(list);
    return list;
  };

  const handleSupplierCreated = async (created: Supplier) => {
    const list = await reloadSuppliers();
    const supplier = list.find((s) => s.id === created.id) ?? created;
    setSupplierId(supplier.id);
  };

  const handleDeviceModelCreated = async (created: DeviceModel) => {
    const models = await inventoryService.getDeviceModels();
    const model = models.find((x) => x.id === created.id) ?? created;
    setDeviceModels(models);
    applyDeviceModelSelection(model);
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
    if (!name?.trim()) return;
    const parentId = locationMiddleId ?? locationRootId ?? undefined;
    try {
      const created = await inventoryService.createLocation({ name: name.trim(), parentId });
      setLocationReloadToken((t) => t + 1);
      if (!parentId) {
        setLocationRootId(created.id);
        setLocationMiddleId(null);
        setLocationLeafId(null);
      } else if (locationMiddleId) {
        setLocationLeafId(created.id);
      } else {
        setLocationMiddleId(created.id);
        setLocationLeafId(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Konum oluşturulamadı');
    }
  };

  if (initializing) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <>
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
          <FormField
            label="Ürün kodu (iç SKU)"
            required
            hint={mode === 'edit' ? 'Kod oluşturulduktan sonra değiştirilmez' : 'Demirbaş etiketi bu kod ile aynıdır'}
            error={fieldError(fieldErrors, 'code')}
          >
            <input
              className={`${formInput} uppercase${mode === 'edit' ? ' bg-gray-50 text-gray-600' : ''}`}
              value={form.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              readOnly={mode === 'edit'}
              required
              placeholder="Örn. LAPTOP-001"
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

      <FormSection title="Stok ve fiyat" description="Ürün açıklaması ve tahmini birim fiyat">
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
                {categoryStock.currency}
              </span>
            </div>
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

              {warehouses.length > 0 && (
                <FormField
                  label="Depo"
                  hint={
                    mode === 'create'
                      ? 'Boş bırakırsanız ürün doğrudan zimmetlenir'
                      : warehouses.length === 1
                        ? 'Tek depo mevcut'
                        : undefined
                  }
                  error={fieldError(fieldErrors, 'warehouseId')}
                >
                  <select
                    className={`${formSelect}${fieldError(fieldErrors, 'warehouseId') ? ' border-red-500' : ''}`}
                    value={form.warehouseId ?? ''}
                    onChange={(e) => {
                      const nextId = e.target.value ? Number(e.target.value) : null;
                      setForm({ ...form, warehouseId: nextId });
                      if (nextId != null) {
                        setAssignmentState(emptyProductAssignmentState());
                      }
                    }}
                  >
                    <option value="">
                      {mode === 'create' ? 'Depo seçme (zimmetle)' : 'Depo seç'}
                    </option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </FormField>
              )}

              <FormField
                label="Demirbaş etiketi"
                required={assetFieldsRequired}
                hint="Ürün kodu ile aynıdır"
                error={fieldError(fieldErrors, 'code', 'assetLabel')}
              >
                <input
                  readOnly
                  className={`${formInput} bg-gray-50 text-gray-600`}
                  value={form.code}
                  placeholder="Önce ürün kodunu girin"
                />
              </FormField>

              <FormField
                label="Seri no"
                required={assetFieldsRequired}
                error={fieldError(fieldErrors, 'serialNumber', 'serialnumber')}
              >
                <input
                  className={`${formInput}${fieldError(fieldErrors, 'serialNumber', 'serialnumber') ? ' border-red-500' : ''}`}
                  value={form.serialNumber || ''}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                />
              </FormField>

              <FormField
                label="Marka / model"
                required={assetFieldsRequired}
                error={fieldError(fieldErrors, 'deviceModelId')}
                className="sm:col-span-2"
                hint="Listeden seçin; seçtikten sonra kalem ile düzenleyebilirsiniz"
              >
                <div className="flex gap-2 items-center">
                  <div className="min-w-0 flex-1">
                    <SearchableDeviceModelSelect
                      models={deviceModels}
                      value={form.deviceModelId ?? null}
                      hasError={Boolean(fieldError(fieldErrors, 'deviceModelId'))}
                      onChange={applyDeviceModelSelection}
                    />
                  </div>
                  {form.deviceModelId != null && (
                    <button
                      type="button"
                      className={btnInline}
                      onClick={() => setShowEditDeviceModelModal(true)}
                      title="Marka / model düzenle"
                      aria-label="Marka / model düzenle"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button type="button" className={btnInlinePrimary} onClick={() => setShowDeviceModelModal(true)}>
                    Yeni
                  </button>
                </div>
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

              {showDefaultLocationPickers && (
              <FormField
                label="Konum"
                required={assetFieldsRequired}
                className="sm:col-span-2"
                error={fieldError(fieldErrors, 'defaultParentLocationId', 'defaultChildLocationId')}
              >
                <InputWithButton
                  button={
                    <button type="button" className={btnInlinePrimary} onClick={createLocation}>
                      Yeni
                    </button>
                  }
                >
                  <div className="w-full">
                    <LocationHierarchyPickers
                      rootId={locationRootId}
                      middleId={locationMiddleId}
                      leafId={locationLeafId}
                      onRootChange={setLocationRootId}
                      onMiddleChange={setLocationMiddleId}
                      onLeafChange={setLocationLeafId}
                      showLeaf
                      reloadToken={locationReloadToken}
                    />
                  </div>
                </InputWithButton>
              </FormField>
              )}

              {showCreateAssignment && (
                <div className="sm:col-span-2">
                  <ProductCreateAssignmentSection
                    value={assignmentState}
                    onChange={setAssignmentState}
                    fieldErrors={fieldErrors}
                  />
                </div>
              )}
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
              <FormField label="Garanti bitiş süresi">
                <input
                  type="date"
                  className={formInput}
                  value={form.warrantyExpiryDate || ''}
                  onChange={(e) => setForm({ ...form, warrantyExpiryDate: e.target.value })}
                />
              </FormField>
              <FormField label="Tedarikçi">
                <InputWithButton
                  button={
                    <button type="button" className={btnInlinePrimary} onClick={() => setShowCreateSupplierModal(true)}>
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
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <FormField label="Dosya yükle" hint="jpg, webp, png, gif, svg — en fazla 8 MB" className="flex-1">
            <input
              type="file"
              accept=".jpg,.jpeg,.webp,.png,.gif,.svg,image/*"
              multiple
              onChange={(e) => handleImages(e.target.files)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </FormField>
          <button
            type="button"
            onClick={() => setShowCameraModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 whitespace-nowrap"
          >
            Kameradan çek
          </button>
        </div>
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

      {selectedCategory && (
        <p className="text-sm text-gray-500 border border-gray-200 rounded-md bg-gray-50 px-4 py-3">
          <span className="font-medium text-gray-700">Kategori stok ayarları</span>
          {' — '}
          {getUnitToLabel(categoryStock.unitOfMeasure)}, min {categoryStock.minQuantity}, max{' '}
          {categoryStock.maxQuantity}, {categoryStock.currency}
          <span className="text-gray-400"> (kayıtta otomatik uygulanır)</span>
        </p>
      )}

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

    <CreateDeviceModelModal
      isOpen={showDeviceModelModal}
      onClose={() => setShowDeviceModelModal(false)}
      onCreated={handleDeviceModelCreated}
    />
    <EditDeviceModelModal
      isOpen={showEditDeviceModelModal}
      model={selectedModel}
      onClose={() => setShowEditDeviceModelModal(false)}
      onUpdated={handleDeviceModelUpdated}
    />
    <CreateSupplierModal
      isOpen={showCreateSupplierModal}
      defaultCategoryId={form.categoryId}
      onClose={() => setShowCreateSupplierModal(false)}
      onCreated={handleSupplierCreated}
    />
    <CameraCaptureModal
      isOpen={showCameraModal}
      onClose={() => setShowCameraModal(false)}
      onCapture={handleCameraCapture}
    />
    </>
  );
};
