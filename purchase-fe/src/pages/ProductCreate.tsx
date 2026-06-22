import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ProductForm } from '../components/product/ProductForm';

export const ProductCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cloneFromParam = searchParams.get('cloneFrom');
  const cloneFromId = cloneFromParam ? Number.parseInt(cloneFromParam, 10) : undefined;
  const isClone = Boolean(cloneFromId && !Number.isNaN(cloneFromId));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isClone ? 'Ürün klonla' : 'Yeni ürün'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isClone
              ? 'Kaynak ürün bilgileri forma aktarıldı. Yeni kod ve seri numarası girip kaydedin.'
              : 'Demirbaş veya sarf ürün kaydı'}
          </p>
          <ProductForm
            mode="create"
            cloneFromId={isClone ? cloneFromId : undefined}
            onSuccess={() => navigate('/products')}
            onCancel={() => navigate('/products')}
          />
        </div>
      </div>
    </div>
  );
};
