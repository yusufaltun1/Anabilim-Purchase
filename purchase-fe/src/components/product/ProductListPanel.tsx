import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductLabelPrint } from '../ProductLabelPrint';
import { authService } from '../../services/auth.service';
import { productService } from '../../services/product.service';
import { Product, PRODUCT_TYPE_LABELS } from '../../types/product';
import { CATEGORY_PRODUCT_TYPE_OPTIONS } from '../../types/category';

const productTypeLabel = (type?: string) =>
  CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === type)?.label ||
  (type && PRODUCT_TYPE_LABELS[type as keyof typeof PRODUCT_TYPE_LABELS]?.label) ||
  type ||
  '';

const formatCurrency = (amount: number, currency?: string) => {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('tr-TR')} ₺`;
  }
};

interface ProductListPanelProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
  showHeader?: boolean;
  title?: string;
  headerAction?: React.ReactNode;
}

export const ProductListPanel = ({
  products,
  loading = false,
  emptyMessage = 'Henüz hiç ürün bulunmuyor.',
  onRefresh,
  showHeader = true,
  title = 'Ürünler',
  headerAction,
}: ProductListPanelProps) => {
  const navigate = useNavigate();
  const canInventoryManage = authService.hasCapability('INVENTORY_MANAGE');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    try {
      setDeleting(true);
      const res = await productService.deleteProduct(id);
      if (!res.success) throw new Error(res.message);
      onRefresh?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ürün silinirken hata oluştu';
      window.alert(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {showHeader && (
          <div className="px-4 py-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {headerAction}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : products.length === 0 ? (
          <p className="p-6 text-center text-gray-500 text-sm">{emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-indigo-600 truncate">{product.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {product.code}
                            </span>
                            {product.productType && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {productTypeLabel(String(product.productType))}
                              </span>
                            )}
                            {(product.active === false || product.isActive === false) && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Pasif
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center flex-wrap justify-end gap-2 sm:gap-4">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(product.imageUrl!)}
                          />
                        )}
                        <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {formatCurrency(product.estimatedUnitPrice || 0)}
                        </p>
                        {product.mustReturnFirst && (
                          <span className="text-xs text-orange-600 font-medium" title="Önce depoya iade">
                            Kullanımda
                          </span>
                        )}
                        {product.canAssign && (
                          <button
                            type="button"
                            onClick={() => navigate(`/products/${product.id}?assign=1`)}
                            className="text-green-600 hover:text-green-900 font-medium text-sm"
                          >
                            Zimmetle
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                        >
                          Detay
                        </button>
                        {canInventoryManage && (
                          <button
                            type="button"
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                            className="text-yellow-600 hover:text-yellow-900 font-medium text-sm"
                          >
                            Düzenle
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPrintingProduct(product)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                        >
                          Bas
                        </button>
                        {canInventoryManage && (
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900 font-medium text-sm disabled:opacity-50"
                          >
                            Sil
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between gap-2">
                      {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                      )}
                      <p className="text-sm text-gray-500 sm:text-right flex-shrink-0">
                        Miktar: {product.minQuantity ?? '—'} - {product.maxQuantity ?? '—'}{' '}
                        {product.unitOfMeasure || ''}
                        {product.serialNumber ? ` · Seri: ${product.serialNumber}` : ''}
                        {product.assetLabel ? ` · Etiket: ${product.assetLabel}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Büyük resim görünümü"
            className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {printingProduct && (
        <ProductLabelPrint
          productId={printingProduct.id}
          productName={printingProduct.name}
          onClose={() => setPrintingProduct(null)}
        />
      )}
    </>
  );
};
