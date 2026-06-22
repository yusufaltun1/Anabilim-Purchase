import type { IconType } from 'react-icons';
import {
  FiArchive,
  FiBox,
  FiCpu,
  FiFolder,
  FiHash,
  FiHome,
  FiLayers,
  FiMapPin,
  FiPackage,
  FiTag,
  FiTool,
  FiUserCheck,
  FiActivity,
} from 'react-icons/fi';
import { Product } from '../../types/product';

export const EmptyCell = () => <span className="text-gray-300">—</span>;

interface IconBadgeProps {
  icon: IconType;
  children: React.ReactNode;
  title?: string;
  mono?: boolean;
}

export const IconBadge = ({ icon: Icon, children, title, mono }: IconBadgeProps) => (
  <div className="flex min-w-0 items-center gap-2" title={title}>
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">
      <Icon className="text-[15px]" aria-hidden />
    </span>
    <span className={`min-w-0 truncate text-sm text-gray-800 ${mono ? 'font-mono text-xs' : ''}`}>
      {children}
    </span>
  </div>
);

interface InfoLineProps {
  icon: IconType;
  label?: string;
  value: string;
}

const InfoLine = ({ icon: Icon, label, value }: InfoLineProps) => (
  <div className="flex min-w-0 items-center gap-1.5" title={value}>
    <Icon className="shrink-0 text-[13px] text-gray-400" aria-hidden />
    {label && <span className="shrink-0 text-xs text-gray-400">{label}</span>}
    <span className="truncate text-sm text-gray-700">{value}</span>
  </div>
);

const STOCK_STATUS_META: Record<
  string,
  { label: string; icon: IconType }
> = {
  IN_STOCK: { label: 'Stokta', icon: FiPackage },
  ASSIGNED: { label: 'Zimmetli', icon: FiUserCheck },
  IN_USE: { label: 'Kullanımda', icon: FiActivity },
  MAINTENANCE: { label: 'Bakımda', icon: FiTool },
  RETIRED: { label: 'Emekli', icon: FiArchive },
};

export const ProductNameCell = ({
  name,
  code,
  productType,
}: {
  name: string;
  code: string;
  productType?: string;
}) => (
  <div className="min-w-0">
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
        <FiBox className="text-[15px]" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900" title={name}>
          {name}
        </p>
        <p className="mt-0.5 truncate text-xs text-gray-500" title={code}>
          {code}
        </p>
      </div>
    </div>
    {productType && (
      <div className="mt-1.5 flex items-center gap-1 pl-9">
        <FiLayers className="shrink-0 text-[12px] text-gray-400" aria-hidden />
        <span className="truncate text-xs text-gray-500">{productType}</span>
      </div>
    )}
  </div>
);

export const AssetLabelCell = ({ label }: { label?: string }) => {
  if (!label) return <EmptyCell />;
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1"
      title={label}
    >
      <FiTag className="shrink-0 text-[13px] text-gray-400" aria-hidden />
      <span className="truncate font-mono text-xs font-medium text-gray-800">{label}</span>
    </span>
  );
};

export const SerialNumberCell = ({ serialNumber }: { serialNumber?: string }) => {
  if (!serialNumber) return <EmptyCell />;
  return <IconBadge icon={FiHash} mono title={serialNumber}>{serialNumber}</IconBadge>;
};

export const ModelCell = ({ modelName }: { modelName?: string }) => {
  if (!modelName) return <EmptyCell />;
  return <IconBadge icon={FiCpu} title={modelName}>{modelName}</IconBadge>;
};

export const CategoryCell = ({ name }: { name?: string }) => {
  if (!name) return <EmptyCell />;
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1"
      title={name}
    >
      <FiFolder className="shrink-0 text-[13px] text-gray-500" aria-hidden />
      <span className="truncate text-xs font-medium text-gray-700">{name}</span>
    </span>
  );
};

export const StockStatusCell = ({ product }: { product: Product }) => {
  const stockMeta = product.stockItemStatus
    ? STOCK_STATUS_META[product.stockItemStatus]
    : undefined;
  const isInactive = product.active === false || product.isActive === false;
  const StockIcon = stockMeta?.icon ?? FiPackage;

  if (!stockMeta && !product.assetConditionName && !isInactive && !product.mustReturnFirst) {
    return <EmptyCell />;
  }

  return (
    <div className="space-y-1.5">
      {stockMeta && (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700">
          <StockIcon className="shrink-0 text-[13px] text-gray-500" aria-hidden />
          {stockMeta.label}
        </span>
      )}
      {product.assetConditionName && (
        <p className="flex items-center gap-1 text-xs text-gray-500" title={product.assetConditionName}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" aria-hidden />
          {product.assetConditionName}
        </p>
      )}
      {isInactive && (
        <p className="text-xs text-gray-400">Pasif kayıt</p>
      )}
      {product.mustReturnFirst && (
        <p className="text-xs text-gray-400">Önce iade gerekli</p>
      )}
    </div>
  );
};

export const LocationCell = ({ product }: { product: Product }) => {
  const hasSchool = Boolean(product.schoolName);
  const hasParent = Boolean(product.defaultParentLocationName);
  const hasChild = Boolean(product.defaultChildLocationName);

  if (!hasSchool && !hasParent && !hasChild) {
    return <EmptyCell />;
  }

  return (
    <div className="space-y-1">
      {hasSchool && (
        <InfoLine icon={FiHome} value={product.schoolName!} />
      )}
      {hasParent && (
        <InfoLine icon={FiMapPin} value={product.defaultParentLocationName!} />
      )}
      {hasChild && (
        <div className="pl-4">
          <InfoLine icon={FiMapPin} label="Alt" value={product.defaultChildLocationName!} />
        </div>
      )}
    </div>
  );
};
