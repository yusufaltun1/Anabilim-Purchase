import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy, FiEye, FiEdit2, FiPrinter, FiTrash2, FiUserPlus, FiImage } from 'react-icons/fi';
import { ProductLabelPrint } from '../ProductLabelPrint';
import { authService } from '../../services/auth.service';
import { productService } from '../../services/product.service';
import { Product, PRODUCT_TYPE_LABELS } from '../../types/product';
import { CATEGORY_PRODUCT_TYPE_OPTIONS } from '../../types/category';
import {
  AssetLabelCell,
  CategoryCell,
  LocationCell,
  ModelCell,
  ProductNameCell,
  SerialNumberCell,
  StockStatusCell,
} from './productListVisuals';

const productTypeLabel = (type?: string) =>
  CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === type)?.label ||
  (type && PRODUCT_TYPE_LABELS[type as keyof typeof PRODUCT_TYPE_LABELS]?.label) ||
  type ||
  '';

const getProductImage = (product: Product): string | undefined =>
  product.imageUrl || product.imageUrls?.[0];

const thClass =
  'px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap';
const tdClass = 'px-3 py-3 align-middle text-sm text-gray-700';

interface IconActionButtonProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}

const IconActionButton = ({ title, onClick, disabled, danger, children }: IconActionButtonProps) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border-0 !bg-transparent !p-0 text-[17px] text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 ${
      danger ? 'hover:!bg-red-50 hover:!text-red-600' : ''
    }`}
  >
    {children}
  </button>
);

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

  const renderThumbnail = (product: Product) => {
    const imageSrc = getProductImage(product);

    if (imageSrc) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedImage(imageSrc);
          }}
          className="block h-14 w-11 overflow-hidden rounded border border-gray-200 bg-gray-50 !p-0 transition hover:border-gray-300"
          title="Görseli büyüt"
        >
          <img src={imageSrc} alt={product.name} className="h-full w-full object-cover" />
        </button>
      );
    }

    return (
      <div
        className="flex h-14 w-11 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-gray-300"
        title="Görsel yok"
      >
        <FiImage className="text-lg" aria-hidden />
      </div>
    );
  };

  const renderActions = (product: Product) => (
    <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
      {product.canAssign && (
        <IconActionButton
          title="Zimmetle"
          onClick={() => navigate(`/products/${product.id}?assign=1`)}
        >
          <FiUserPlus />
        </IconActionButton>
      )}
      <IconActionButton title="Detay" onClick={() => navigate(`/products/${product.id}`)}>
        <FiEye />
      </IconActionButton>
      {canInventoryManage && (
        <IconActionButton
          title="Klonla"
          onClick={() => navigate(`/products/create?cloneFrom=${product.id}`)}
        >
          <FiCopy />
        </IconActionButton>
      )}
      {canInventoryManage && (
        <IconActionButton
          title="Düzenle"
          onClick={() => navigate(`/products/edit/${product.id}`)}
        >
          <FiEdit2 />
        </IconActionButton>
      )}
      <IconActionButton title="Etiket bas" onClick={() => setPrintingProduct(product)}>
        <FiPrinter />
      </IconActionButton>
      {canInventoryManage && (
        <IconActionButton
          title="Sil"
          danger
          disabled={deleting}
          onClick={() => handleDelete(product.id)}
        >
          <FiTrash2 />
        </IconActionButton>
      )}
    </div>
  );

  const stickyActionHeadClass = `${thClass} sticky right-0 z-20 bg-gray-50 shadow-[-6px_0_8px_-4px_rgba(0,0,0,0.08)]`;
  const stickyActionCellClass = `${tdClass} sticky right-0 z-10 bg-white shadow-[-6px_0_8px_-4px_rgba(0,0,0,0.06)] group-hover:bg-gray-50`;

  return (
    <>
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        {showHeader && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-5">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {headerAction}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
          </div>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <colgroup>
                <col className="w-[52px]" />
                <col className="w-[17%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[13%]" />
                <col className="w-[168px]" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className={thClass}>
                    Görsel
                  </th>
                  <th scope="col" className={thClass}>
                    Ürün
                  </th>
                  <th scope="col" className={thClass}>
                    Etiket
                  </th>
                  <th scope="col" className={thClass}>
                    Seri no
                  </th>
                  <th scope="col" className={thClass}>
                    Model
                  </th>
                  <th scope="col" className={thClass}>
                    Kategori
                  </th>
                  <th scope="col" className={thClass}>
                    Stok / Zimmet
                  </th>
                  <th scope="col" className={thClass}>
                    Konum
                  </th>
                  <th scope="col" className={stickyActionHeadClass}>
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="group cursor-pointer transition hover:bg-gray-50"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <td className={tdClass}>{renderThumbnail(product)}</td>
                    <td className={tdClass}>
                      <ProductNameCell
                        name={product.name}
                        code={product.code}
                        productType={
                          product.productType
                            ? productTypeLabel(String(product.productType))
                            : undefined
                        }
                      />
                    </td>
                    <td className={tdClass}>
                      <AssetLabelCell label={product.assetLabel} />
                    </td>
                    <td className={tdClass}>
                      <SerialNumberCell serialNumber={product.serialNumber} />
                    </td>
                    <td className={tdClass}>
                      <ModelCell modelName={product.deviceModelName} />
                    </td>
                    <td className={tdClass}>
                      <CategoryCell name={product.category?.name} />
                    </td>
                    <td className={tdClass}>
                      <StockStatusCell product={product} />
                    </td>
                    <td className={tdClass}>
                      <LocationCell product={product} />
                    </td>
                    <td className={stickyActionCellClass}>{renderActions(product)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-10 rounded-full border-0 bg-black/50 !p-2 text-white transition hover:bg-black/70"
            aria-label="Kapat"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Büyük görsel"
            className="max-h-[80vh] max-w-[80vw] rounded-lg object-contain shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {printingProduct && (
        <ProductLabelPrint
          productCode={printingProduct.code || printingProduct.assetLabel || ''}
          productName={printingProduct.name}
          onClose={() => setPrintingProduct(null)}
        />
      )}
    </>
  );
};
