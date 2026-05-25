import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ProductForm } from '../components/product/ProductForm';

export const ProductCreate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Yeni ürün</h1>
          <p className="text-sm text-gray-500 mb-6">Demirbaş veya sarf ürün kaydı</p>
          <ProductForm mode="create" onSuccess={() => navigate('/products')} onCancel={() => navigate('/products')} />
        </div>
      </div>
    </div>
  );
};
