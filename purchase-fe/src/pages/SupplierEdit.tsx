import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Navigation } from '../components/Navigation';
import { supplierService } from '../services/supplier.service';
import { categoryService } from '../services/category.service';
import { Category } from '../types/category';
import { UpdateSupplierRequest } from '../types/supplier';

interface CategoryOption {
  value: number;
  label: string;
}

export const SupplierEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<UpdateSupplierRequest>({
    name: '',
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
    isActive: true,
    isPreferred: false,
    categoryIds: []
  });

  useEffect(() => {
    Promise.all([loadSupplier(), loadCategories()]);
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setError(response.message || 'Kategoriler yüklenirken bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Kategoriler yüklenirken bir hata oluştu');
    }
  };

  const loadSupplier = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const supplier = await supplierService.getSupplierById(parseInt(id));
      setFormData({
        name: supplier.name,
        taxOffice: supplier.taxOffice,
        address: supplier.address,
        phone: supplier.phone,
        email: supplier.email,
        website: supplier.website,
        contactPerson: supplier.contactPerson,
        contactPhone: supplier.contactPhone,
        contactEmail: supplier.contactEmail,
        bankAccount: supplier.bankAccount,
        iban: supplier.iban,
        isActive: supplier.isActive,
        isPreferred: supplier.isPreferred,
        categoryIds: supplier.categories.map(cat => cat.id)
      });
    } catch (err: any) {
      setError(err.message || 'Tedarikçi bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const categoryOptions = Array.isArray(categories) ? categories.map(category => ({
    value: category.id,
    label: category.name
  })) : [];

  const selectedCategories = categoryOptions.filter(option => 
    formData.categoryIds.includes(option.value)
  );

  const handleCategoryChange = (selectedOptions: readonly CategoryOption[] | null) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await supplierService.updateSupplier(parseInt(id), formData);
      
      if (response.success) {
        navigate('/suppliers');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Tedarikçi güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tedarikçi Düzenle</h1>
            <button
              onClick={() => navigate('/suppliers')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Geri
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Firma Adı
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700">
                  Vergi Dairesi
                </label>
                <input
                  type="text"
                  name="taxOffice"
                  id="taxOffice"
                  required
                  value={formData.taxOffice}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adres
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Web Sitesi
                </label>
                <input
                  type="url"
                  name="website"
                  id="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                  İletişim Kişisi
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  id="contactPerson"
                  required
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  İletişim Telefonu
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  id="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  İletişim E-postası
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  id="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">
                  Banka Hesabı
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  id="bankAccount"
                  required
                  value={formData.bankAccount}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="iban" className="block text-sm font-medium text-gray-700">
                  IBAN
                </label>
                <input
                  type="text"
                  name="iban"
                  id="iban"
                  required
                  value={formData.iban}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Aktif
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPreferred"
                  id="isPreferred"
                  checked={formData.isPreferred}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPreferred: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPreferred" className="ml-2 block text-sm text-gray-900">
                  Tercih Edilen Tedarikçi
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tedarik Edilen Kategoriler
                </label>
                <Select
                  isMulti
                  name="categories"
                  options={categoryOptions}
                  value={selectedCategories}
                  onChange={handleCategoryChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Kategorileri seçin..."
                  noOptionsMessage={() => "Kategori bulunamadı"}
                  isSearchable
                  isClearable
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#4F46E5',
                      primary75: '#6366F1',
                      primary50: '#818CF8',
                      primary25: '#C7D2FE',
                    },
                  })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/suppliers')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 