import { Category } from './category';

export enum ProductType {
  CONSUMABLE = 'CONSUMABLE',
  FIXED_ASSET = 'FIXED_ASSET',
  EQUIPMENT = 'EQUIPMENT',
  SERVICE = 'SERVICE',
  SOFTWARE = 'SOFTWARE',
  MAINTENANCE = 'MAINTENANCE',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  IT_HARDWARE = 'IT_HARDWARE',
  FURNITURE = 'FURNITURE',
  OTHER = 'OTHER'
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, { label: string; description: string }> = {
  [ProductType.CONSUMABLE]: { label: 'Sarf Malzemesi', description: 'Tüketilen malzemeler' },
  [ProductType.FIXED_ASSET]: { label: 'Demirbaş', description: 'Sabit kıymet olarak kayıtlanan malzemeler' },
  [ProductType.EQUIPMENT]: { label: 'Ekipman', description: 'Kullanılan ancak tüketilmeyen malzemeler' },
  [ProductType.SERVICE]: { label: 'Hizmet', description: 'Hizmet alımları' },
  [ProductType.SOFTWARE]: { label: 'Yazılım', description: 'Yazılım lisansları' },
  [ProductType.MAINTENANCE]: { label: 'Bakım', description: 'Bakım ve onarım malzemeleri' },
  [ProductType.OFFICE_SUPPLIES]: { label: 'Ofis Malzemeleri', description: 'Günlük ofis kullanımı için malzemeler' },
  [ProductType.IT_HARDWARE]: { label: 'IT Donanımı', description: 'Bilgi işlem donanımları' },
  [ProductType.FURNITURE]: { label: 'Mobilya', description: 'Ofis mobilyaları' },
  [ProductType.OTHER]: { label: 'Diğer', description: 'Diğer ürün tipleri' }
};

// Helper function to map Turkish labels back to enum keys
export const getProductTypeFromLabel = (label: string): ProductType => {
  const entry = Object.entries(PRODUCT_TYPE_LABELS).find(([key, value]) => value.label === label);
  return entry ? (entry[0] as ProductType) : ProductType.OTHER;
};

export interface Product {
  id: number;
  name: string;
  description: string;
  code: string;
  unitOfMeasure: string;
  productType?: ProductType;
  category?: Category;
  categories?: Category[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  estimatedUnitPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  suppliers?: any[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  code: string;
  unitOfMeasure: string;
  productType: ProductType;
  categoryId: number | null;
  minQuantity: number;
  maxQuantity: number;
  estimatedUnitPrice: number;
  currency: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  code: string;
  unitOfMeasure: string;
  productType: ProductType;
  categoryId: number | null;
  minQuantity?: number;
  maxQuantity?: number;
  estimatedUnitPrice?: number;
  currency?: string;
  isActive: boolean;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product | Product[];
  timestamp: string;
} 