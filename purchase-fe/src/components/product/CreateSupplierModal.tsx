import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { categoryService } from '../../services/category.service';
import { supplierService } from '../../services/supplier.service';
import { Category } from '../../types/category';
import { CreateSupplierRequest, Supplier } from '../../types/supplier';
import { formGrid, formInput, formTextarea } from '../common/formStyles';

interface CategoryOption {
  value: number;
  label: string;
}

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (supplier: Supplier) => void | Promise<void>;
  defaultCategoryId?: number | null;
}

const emptyForm = (defaultCategoryId?: number | null): CreateSupplierRequest => ({
  name: '',
  taxNumber: '',
  taxOffice: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  bankAccount: '',
  iban: '',
  isPreferred: false,
  isActive: true,
  categoryIds: defaultCategoryId ? [defaultCategoryId] : [],
});

const validateForm = (formData: CreateSupplierRequest): string[] => {
  const errors: string[] = [];
  if (formData.taxNumber && formData.taxNumber.replace(/\D/g, '').length !== 10) {
    errors.push('Vergi numarası 10 haneli olmalıdır');
  }
  if (
    formData.contactPhone &&
    (formData.contactPhone.replace(/\D/g, '').length < 10 ||
      formData.contactPhone.replace(/\D/g, '').length > 11)
  ) {
    errors.push('İletişim telefonu 10-11 haneli olmalıdır');
  }
  if (
    formData.iban &&
    !/^TR\d{2}\d{4}\d{4}\d{4}\d{4}\d{4}\d{2}$/.test(formData.iban.replace(/\s/g, '').toUpperCase())
  ) {
    errors.push('Geçerli bir IBAN numarası giriniz (TR ile başlayan 26 haneli)');
  }
  return errors;
};

export const CreateSupplierModal = ({
  isOpen,
  onClose,
  onCreated,
  defaultCategoryId,
}: CreateSupplierModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CreateSupplierRequest>(() => emptyForm(defaultCategoryId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const response = await categoryService.getActiveCategories();
    if (response.success && response.data) {
      setCategories(Array.isArray(response.data) ? response.data : [response.data]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm(defaultCategoryId));
      setError(null);
      loadCategories();
    }
  }, [isOpen, defaultCategoryId, loadCategories]);

  const categoryOptions = useMemo<CategoryOption[]>(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );

  const selectedCategories = categoryOptions.filter((option) =>
    formData.categoryIds.includes(option.value)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCategoryChange = (selectedOptions: readonly CategoryOption[] | null) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: selectedOptions ? selectedOptions.map((option) => option.value) : [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await supplierService.createSupplier(formData);
      if (!response.success || !response.data || Array.isArray(response.data)) {
        setError(response.message || 'Tedarikçi oluşturulamadı');
        return;
      }
      await onCreated(response.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Tedarikçi oluşturulamadı');
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
        <div className="relative inline-block w-full max-w-3xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 max-h-[75vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900">Yeni tedarikçi</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tedarikçiyi kaydedin; ürün formunda otomatik seçilecektir.
              </p>

              {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className={`${formGrid} mt-4`}>
                <div>
                  <label htmlFor="supplier-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Firma adı *
                  </label>
                  <input
                    id="supplier-name"
                    type="text"
                    name="name"
                    required
                    className={formInput}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-taxNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi numarası *
                  </label>
                  <input
                    id="supplier-taxNumber"
                    type="text"
                    name="taxNumber"
                    required
                    placeholder="1234567890"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className={formInput}
                    value={formData.taxNumber}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-taxOffice" className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi dairesi *
                  </label>
                  <input
                    id="supplier-taxOffice"
                    type="text"
                    name="taxOffice"
                    required
                    className={formInput}
                    value={formData.taxOffice}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <input
                    id="supplier-phone"
                    type="tel"
                    name="phone"
                    required
                    className={formInput}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="supplier-address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres *
                  </label>
                  <textarea
                    id="supplier-address"
                    name="address"
                    rows={2}
                    required
                    className={formTextarea}
                    value={formData.address}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta *
                  </label>
                  <input
                    id="supplier-email"
                    type="email"
                    name="email"
                    required
                    className={formInput}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-website" className="block text-sm font-medium text-gray-700 mb-1">
                    Web sitesi
                  </label>
                  <input
                    id="supplier-website"
                    type="url"
                    name="website"
                    className={formInput}
                    value={formData.website}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                    İletişim kişisi *
                  </label>
                  <input
                    id="supplier-contactPerson"
                    type="text"
                    name="contactPerson"
                    required
                    className={formInput}
                    value={formData.contactPerson}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    İletişim telefonu *
                  </label>
                  <input
                    id="supplier-contactPhone"
                    type="tel"
                    name="contactPhone"
                    required
                    placeholder="05551234567"
                    pattern="[0-9]{10,11}"
                    maxLength={11}
                    className={formInput}
                    value={formData.contactPhone}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    İletişim e-postası *
                  </label>
                  <input
                    id="supplier-contactEmail"
                    type="email"
                    name="contactEmail"
                    required
                    className={formInput}
                    value={formData.contactEmail}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-bankAccount" className="block text-sm font-medium text-gray-700 mb-1">
                    Banka hesabı *
                  </label>
                  <input
                    id="supplier-bankAccount"
                    type="text"
                    name="bankAccount"
                    required
                    className={formInput}
                    value={formData.bankAccount}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="supplier-iban" className="block text-sm font-medium text-gray-700 mb-1">
                    IBAN
                  </label>
                  <input
                    id="supplier-iban"
                    type="text"
                    name="iban"
                    placeholder="TR33 0001 0002 3456 7890 1234 56"
                    maxLength={34}
                    className={formInput}
                    value={formData.iban}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="supplier-isPreferred"
                    name="isPreferred"
                    checked={formData.isPreferred}
                    onChange={handleChange}
                    disabled={submitting}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                  />
                  <label htmlFor="supplier-isPreferred" className="ml-2 text-sm text-gray-900">
                    Tercih edilen tedarikçi
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tedarik edilen kategoriler
                  </label>
                  <Select
                    isMulti
                    name="categories"
                    options={categoryOptions}
                    value={selectedCategories}
                    onChange={handleCategoryChange}
                    placeholder="Kategorileri seçin..."
                    noOptionsMessage={() => 'Kategori bulunamadı'}
                    isSearchable
                    isClearable
                    isDisabled={submitting}
                    classNamePrefix="select"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Kaydediliyor…' : 'Tedarikçiyi kaydet'}
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
