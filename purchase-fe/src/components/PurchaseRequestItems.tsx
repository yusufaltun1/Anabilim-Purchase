import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Product } from '../types/product';
import { Supplier } from '../types/supplier';
import { PurchaseRequestItem } from '../types/purchase-request';
import { productService } from '../services/product.service';
import { supplierService } from '../services/supplier.service';

interface PurchaseRequestItemsProps {
  items: PurchaseRequestItem[];
  onChange: (items: PurchaseRequestItem[]) => void;
}

interface ProductOption {
  value: number;
  label: string;
  categoryIds: number[];
}

interface SupplierOption {
  value: number;
  label: string;
}

export const PurchaseRequestItems: React.FC<PurchaseRequestItemsProps> = ({ items, onChange }) => {
  console.log('PurchaseRequestItems rendered with items:', items);
  const [products, setProducts] = useState<Product[]>([]);
  const [itemSuppliers, setItemSuppliers] = useState<{ [key: number]: Supplier[] }>({});
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllSuppliers, setShowAllSuppliers] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadProducts();
    loadAllSuppliers();
  }, []);

  const getCategoryIdFromItem = (item: PurchaseRequestItem): number | undefined => {
    const cat = (item as any).product?.category;
    if (cat && typeof cat === 'object' && 'id' in cat) {
      return (cat as any).id;
    }
    return undefined;
  };

  useEffect(() => {
    items.forEach((item, index) => {
      const categoryId = item.productId || getCategoryIdFromItem(item);
      if (categoryId) {
        loadSuppliersByCategory(categoryId, index);
      } else {
        setItemSuppliers(prev => ({ ...prev, [index]: allSuppliers }));
        setShowAllSuppliers(prev => ({ ...prev, [index]: true }));
      }
    });
  }, [items, allSuppliers]);

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      setLoading(true);
      setError(null);
      const response: any = await productService.getActiveProducts();
      console.log('Products response:', response);
      
      let productsData: Product[] = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response.success && Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        console.error('Invalid products response format:', response);
        setError('Ürünler yüklenirken bir hata oluştu');
        return;
      }

      console.log('Loaded products:', productsData);
      setProducts(productsData);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSuppliers = async () => {
    try {
      const response = await supplierService.getActiveSuppliers();
      const suppliers = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];
      setAllSuppliers(suppliers);
    } catch (err: any) {
      console.error('Tüm tedarikçiler yüklenirken hata:', err);
      setError(err.message || 'Tedarikçiler yüklenirken bir hata oluştu');
    }
  };

  const loadSuppliersByCategory = async (categoryId: number, itemIndex: number) => {
    try {
      console.log('Loading suppliers for category:', categoryId);
      const response = await supplierService.getSuppliersByCategory(categoryId);
      const suppliers = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];
      setItemSuppliers(prev => ({ ...prev, [itemIndex]: suppliers }));
    } catch (err) {
      console.error('Kategoriye göre tedarikçiler yüklenirken hata:', err);
      setItemSuppliers(prev => ({ ...prev, [itemIndex]: allSuppliers }));
    }
  };

  const handleAddItem = () => {
    const newItem: PurchaseRequestItem = {
      id: Date.now(),
      product: {
        id: 0,
        name: '',
        code: '',
        description: '',
        category: '',
        unit: ''
      },
      quantity: 1,
      potentialSuppliers: [],
      supplierQuotes: [],
      selectedSupplierId: null,
      estimatedDeliveryDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productId: 0,
      potentialSupplierIds: [],
      productName: '',
      description: '',
      imageBase64: '',
      productLink: ''
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
    
    // Temizle
    setShowAllSuppliers(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleItemChange = async (index: number, field: keyof PurchaseRequestItem, value: any) => {
    const newItems = [...items];
    
    if (field === 'productId') {
      console.log('Selected product ID:', value);
      const selectedProduct = products.find(p => p.id === value);
      console.log('Selected product:', selectedProduct);
      
      // Ürünün category veya categories alanını kontrol et
      const categoryId = selectedProduct?.category?.id || 
                        (selectedProduct?.categories && selectedProduct.categories.length > 0 ? selectedProduct.categories[0].id : null);
      
      // ProductId'yi her zaman set et
      newItems[index] = {
        ...newItems[index],
        productId: value,
        product: selectedProduct ? {
          id: selectedProduct.id,
          name: selectedProduct.name,
          code: selectedProduct.code || '',
          description: selectedProduct.description || '',
          category: (selectedProduct as any).category || '',
          unit: (selectedProduct as any).unit || ''
        } : newItems[index].product,
        productName: selectedProduct?.name || newItems[index].productName || '',
        description: selectedProduct?.description || newItems[index].description || ''
      };
      
      if (categoryId) {
        console.log('Loading suppliers for category:', categoryId);
        await loadSuppliersByCategory(categoryId, index);
        setShowAllSuppliers(prev => ({ ...prev, [index]: false }));
        // Tedarikçi listesini sıfırla
        newItems[index].potentialSupplierIds = [];
      } else {
        console.warn('Product has no category:', selectedProduct);
        // Kategori yoksa tüm tedarikçileri göster
        setShowAllSuppliers(prev => ({ ...prev, [index]: true }));
        newItems[index].potentialSupplierIds = newItems[index].potentialSupplierIds || [];
      }
    } else if (field === 'estimatedDeliveryDate') {
      newItems[index] = {
        ...newItems[index],
        [field]: value + 'T00:00:00'
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }
    
    onChange(newItems);
  };

  const toggleSupplierView = (index: number) => {
    setShowAllSuppliers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const productOptions: ProductOption[] = products.map(product => ({
    value: product.id,
    label: product.name,
    categoryIds: product.category ? [product.category.id] : (product.categories?.map(c => c.id) || [])
  }));

  const getSupplierOptions = (index: number): SupplierOption[] => {
    const suppliers = showAllSuppliers[index] ? allSuppliers : (itemSuppliers[index] || allSuppliers);
    return suppliers.map(supplier => ({
      value: supplier.id,
      label: supplier.name
    }));
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border p-4 rounded-lg bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Ürün Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ürün</label>
              <Select
                options={productOptions}
                value={productOptions.find(option => option.value === item.productId)}
                onChange={(option) => handleItemChange(index, 'productId', option?.value)}
                className="mt-1"
                placeholder="Ürün seçin..."
              />
            </div>

            {/* Ürün Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
              <input
                type="text"
                value={item.productName || ''}
                onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ürün adını girin..."
              />
            </div>

            {/* Miktar */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Miktar</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Açıklama */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                value={item.description || ''}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ürün açıklamasını girin..."
              />
            </div>

            {/* Ürün Linki */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Ürün Linki</label>
              <input
                type="url"
                value={item.productLink || ''}
                onChange={(e) => handleItemChange(index, 'productLink', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://www.example.com/product"
              />
            </div>

            {/* Ürün Resmi */}
            {item.imageBase64 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Resmi</label>
                <div className="relative inline-block">
                  <img
                    src={item.imageBase64}
                    alt="Ürün resmi"
                    className="w-full max-w-md h-48 object-cover rounded-md border border-gray-300"
                  />
                </div>
              </div>
            )}

            {/* Potansiyel Tedarikçiler */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Potansiyel Tedarikçiler</label>
                  <button
                    type="button"
                    onClick={() => toggleSupplierView(index)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {showAllSuppliers[index] ? 'Sadece Kategorideki Tedarikçileri Göster' : 'Tüm Tedarikçileri Göster'}
                  </button>
              </div>
              <Select
                isMulti
                options={getSupplierOptions(index)}
                value={getSupplierOptions(index).filter(option => item.potentialSupplierIds?.includes(option.value))}
                onChange={(options) => handleItemChange(index, 'potentialSupplierIds', options.map(o => o.value))}
                className="mt-1"
                placeholder="Tedarikçileri seçin..."
              />
            </div>

            {/* Tahmini Teslim Tarihi */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tahmini Teslim Tarihi</label>
              <input
                type="date"
                value={item.estimatedDeliveryDate?.split('T')[0] || ''}
                onChange={(e) => handleItemChange(index, 'estimatedDeliveryDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Notlar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notlar</label>
              <textarea
                value={item.notes || ''}
                onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ek notlar..."
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sil
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ürün Ekle
        </button>
      </div>
    </div>
  );
}; 