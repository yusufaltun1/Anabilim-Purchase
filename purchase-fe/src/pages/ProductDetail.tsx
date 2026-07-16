import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { productService } from '../services/product.service';
import { warehouseService } from '../services/warehouse.service';
import { assignmentService } from '../services/assignment.service';
import { userService } from '../services/user.service';
import { schoolService } from '../services/school.service';
import { locationService } from '../services/location.service';
import { Product, PRODUCT_TYPE_LABELS } from '../types/product';
import { StockItem } from '../types/warehouse';
import { Assignment, AssignmentStatus } from '../types/assignment';
import { User } from '../types/user';
import { School } from '../types/school';
import { Location } from '../types/location';
import { formatDate } from '../utils/date';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/auth.service';
import { ProductProcurementSummary } from '../types/product';
import { ProductStockMovementSection } from '../components/product/ProductStockMovementSection';
import { SerialStockItemSection } from '../components/product/SerialStockItemSection';
import { AssignmentFormPhotoThumb } from '../components/product/AssignmentFormPhotoThumb';
import { AssignmentReturnModal } from '../components/product/AssignmentReturnModal';
import {
  isConsumableProductType,
  shouldSendStockItemIdForAssignment,
  isAssignableStockRow,
  usesQuantityBasedAssignment,
  usesSerialStockItems,
} from '../utils/inventoryProduct';
import {
  mapApiStockItem,
  parseStockQuantityFromNotes,
  warehouseDetailToStockItem,
  warehouseStockToStockItem,
} from '../utils/stockItemMappers';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const canInventoryManage = authService.hasCapability('INVENTORY_MANAGE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockItemsLoading, setStockItemsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    assignmentType: 'user',
    selectedStockItemId: '',
    expectedReturnDate: '',
    notes: '',
    assignedUserId: '',
    assignedSchoolId: '',
    assignedLocationId: '',
    locationDetails: '',
    quantity: 1
  });
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [signedFormUploadingId, setSignedFormUploadingId] = useState<number | null>(null);
  const [assignmentCancellingId, setAssignmentCancellingId] = useState<number | null>(null);
  const [formDownloadingId, setFormDownloadingId] = useState<number | null>(null);
  const signedFormInputRef = useRef<HTMLInputElement>(null);
  const formPhotoInputRef = useRef<HTMLInputElement>(null);
  const [pendingSignedUploadAssignmentId, setPendingSignedUploadAssignmentId] = useState<number | null>(null);
  const [pendingFormPhotoUploadAssignmentId, setPendingFormPhotoUploadAssignmentId] = useState<number | null>(null);
  const [formPhotoUploadingId, setFormPhotoUploadingId] = useState<number | null>(null);
  const [returnTargetAssignment, setReturnTargetAssignment] = useState<Assignment | null>(null);
  const [returningAssignment, setReturningAssignment] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [assignmentFormPhotoFile, setAssignmentFormPhotoFile] = useState<File | null>(null);
  const [assignmentFormPhotoPreview, setAssignmentFormPhotoPreview] = useState<string | null>(null);
  const [procurement, setProcurement] = useState<ProductProcurementSummary | null>(null);
  const [procurementLoading, setProcurementLoading] = useState(false);

  useEffect(() => {
    loadProductData();
  }, [id]);

  useEffect(() => {
    if (product) {
      loadStockItems();
      loadAssignments();
    }
  }, [product]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProductById(parseInt(id!));
      
      console.log('Product loaded:', response);
      console.log('Product active field:', response.active);
      console.log('Product isActive field:', response.isActive);
      console.log('Product type:', response.productType);
      
      setProduct(response);
      loadProcurement(parseInt(id!));
    } catch (err: any) {
      console.error('Error loading product:', err);
      setError(err.message || 'Ürün bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadProcurement = async (productId: number) => {
    try {
      setProcurementLoading(true);
      const data = await productService.getProductProcurement(productId);
      setProcurement(data);
    } catch (err) {
      console.error('Error loading procurement:', err);
      setProcurement({ purchaseRequests: [], purchaseOrders: [] });
    } finally {
      setProcurementLoading(false);
    }
  };

  const requestStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: 'Taslak',
      IN_APPROVAL: 'Onay Bekliyor',
      APPROVED: 'Onaylandı',
      REJECTED: 'Reddedildi',
      CANCELLED: 'İptal Edildi',
      IN_PROGRESS: 'İşlemde',
      PARTIAL_APPROVAL: 'Kısmi Onay',
      COMPLETED: 'Tamamlandı',
      PENDING: 'Beklemede',
    };
    return map[status] || status;
  };

  const orderStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: 'Taslak',
      PENDING: 'Beklemede',
      CONFIRMED: 'Onaylandı',
      SHIPPED: 'Kargoda',
      DELIVERED: 'Teslim Edildi',
      CANCELLED: 'İptal',
      REJECTED: 'Reddedildi',
    };
    return map[status] || status;
  };



  const loadStockItems = async () => {
    const productId = parseInt(id!, 10);
    const productType = product?.productType;

    try {
      setStockItemsLoading(true);

      if (usesSerialStockItems(productType)) {
        const serialItems = await warehouseService.getProductStockItemsList(productId);
        setStockItems(serialItems.map(mapApiStockItem));
        return;
      }

      const stockResponse = await warehouseService.getProductStocks(productId);
      if (stockResponse?.length > 0) {
        setStockItems(stockResponse.map((s) => warehouseStockToStockItem(s, productId)));
        return;
      }

      const detailResponse = await warehouseService.getProductStockDetail(productId);
      if (detailResponse?.warehouseStocks?.length) {
        setStockItems(
          detailResponse.warehouseStocks.map((s) =>
            warehouseDetailToStockItem(s, productId, detailResponse.product.unit)
          )
        );
        return;
      }

      setStockItems([]);
    } catch {
      setStockItems([]);
    } finally {
      setStockItemsLoading(false);
    }
  };

  const isConsumable = isConsumableProductType(product?.productType);
  const usesQuantityForZimmet = usesQuantityBasedAssignment(product?.productType);
  const usesSerialItems = usesSerialStockItems(product?.productType);

  const assignableForZimmet = stockItems.filter((item) => isAssignableStockRow(item));

  const loadAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await assignmentService.getAssignmentsByProduct(parseInt(id!));
      const assignmentsList = Array.isArray(response.data) ? response.data : [];
      setAssignments(assignmentsList);
    } catch (err: any) {
      console.error('Error loading assignments:', err);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await userService.getAllUsers();
      const usersList = Array.isArray(response) ? response : [];
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      setSchoolsLoading(true);
      const response = await schoolService.getAllSchools();
      const schoolsList = response.content || [];
      setSchools(schoolsList);
    } catch (err: any) {
      console.error('Error loading schools:', err);
      setSchools([]);
    } finally {
      setSchoolsLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      setLocationsLoading(true);
      const response = await locationService.getAllLocations();
      const locationsList = Array.isArray(response.data) ? response.data : [];
      setLocations(locationsList);
    } catch (err: any) {
      console.error('Error loading locations:', err);
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleUserSearch = (searchTerm: string) => {
    setUserSearchTerm(searchTerm);
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleDownloadAssignmentForm = async (assignmentId: number) => {
    try {
      setFormDownloadingId(assignmentId);
      await assignmentService.downloadAssignmentForm(assignmentId);
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Zimmet formu indirilemedi', 'error');
    } finally {
      setFormDownloadingId(null);
    }
  };

  const handleUploadSignedFormClick = (assignmentId: number) => {
    setPendingSignedUploadAssignmentId(assignmentId);
    signedFormInputRef.current?.click();
  };

  const handleSignedFormSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const assignmentId = pendingSignedUploadAssignmentId;
    e.target.value = '';
    setPendingSignedUploadAssignmentId(null);
    if (!file || !assignmentId) return;

    try {
      setSignedFormUploadingId(assignmentId);
      await assignmentService.uploadSignedAssignmentForm(assignmentId, file);
      await loadAssignments();
      showNotification('İmzalı zimmet formu yüklendi', 'success');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'İmzalı form yüklenemedi', 'error');
    } finally {
      setSignedFormUploadingId(null);
    }
  };

  const handleDownloadSignedForm = async (assignmentId: number) => {
    try {
      setFormDownloadingId(assignmentId);
      await assignmentService.downloadSignedAssignmentForm(assignmentId);
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'İmzalı form indirilemedi', 'error');
    } finally {
      setFormDownloadingId(null);
    }
  };

  const handleUploadFormPhotoClick = (assignmentId: number) => {
    setPendingFormPhotoUploadAssignmentId(assignmentId);
    formPhotoInputRef.current?.click();
  };

  const handleFormPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const assignmentId = pendingFormPhotoUploadAssignmentId;
    e.target.value = '';
    setPendingFormPhotoUploadAssignmentId(null);
    if (!file || !assignmentId) return;

    try {
      setFormPhotoUploadingId(assignmentId);
      await assignmentService.uploadFormPhoto(assignmentId, file);
      await loadAssignments();
      showNotification('Ürün fotoğrafı yüklendi. Formu yeniden indirerek F8 hücresini kontrol edebilirsiniz.', 'success');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Fotoğraf yüklenemedi', 'error');
    } finally {
      setFormPhotoUploadingId(null);
    }
  };

  const canCancelAssignment = (assignment: Assignment) =>
    assignment.canBeCancelled ??
    (assignment.status === AssignmentStatus.ACTIVE && !assignment.hasSignedForm);

  const handleCancelAssignment = async (assignmentId: number) => {
    if (
      !window.confirm(
        'Bu zimmet kaydını iptal etmek istiyor musunuz? Bağlı stok hareketi silinecek ve kayıt kaldırılacak.'
      )
    ) {
      return;
    }

    try {
      setAssignmentCancellingId(assignmentId);
      await assignmentService.cancelAssignment(assignmentId);
      showNotification('Zimmet iptal edildi, stok hareketi silindi', 'success');
      await Promise.all([loadAssignments(), loadStockItems(), loadProductData()]);
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : 'Zimmet iptal edilirken bir hata oluştu',
        'error'
      );
    } finally {
      setAssignmentCancellingId(null);
    }
  };

  const handleReturnAssignment = async (payload: {
    photo: File;
    document: File;
    notes?: string;
  }) => {
    if (!returnTargetAssignment) return;
    try {
      setReturningAssignment(true);
      await assignmentService.returnAssignment(returnTargetAssignment.id, payload);
      showNotification('Zimmet iade edildi', 'success');
      setReturnTargetAssignment(null);
      await Promise.all([loadAssignments(), loadStockItems(), loadProductData()]);
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : 'Zimmet iade edilirken bir hata oluştu',
        'error'
      );
    } finally {
      setReturningAssignment(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      setAssignmentLoading(true);
      
      // Validasyon
      if (assignmentForm.assignmentType === 'user' && !assignmentForm.assignedUserId) {
        showNotification('Lütfen bir kullanıcı seçin', 'error');
        return;
      }
      
      if (assignmentForm.assignmentType === 'location' && !assignmentForm.assignedLocationId) {
        showNotification('Lütfen bir konum seçin', 'error');
        return;
      }

      // Stock item seçimi kontrolü
      if (!assignmentForm.selectedStockItemId) {
        showNotification('Lütfen bir stock item seçin', 'error');
        return;
      }

      // Stok miktarı kontrolü
      const selectedStock = stockItems.find(item => item.id.toString() === assignmentForm.selectedStockItemId);
      if (!selectedStock) {
        showNotification('Seçilen stok kaydı bulunamadı', 'error');
        return;
      }

      const sendStockItemId = shouldSendStockItemIdForAssignment(product?.productType, selectedStock);

      if (usesQuantityForZimmet) {
        const availableStock = selectedStock.currentStock ?? parseStockQuantityFromNotes(selectedStock.notes);
        if (assignmentForm.quantity > availableStock) {
          showNotification(`Stokta sadece ${availableStock} adet bulunuyor. ${assignmentForm.quantity} adet zimmet edilemez.`, 'error');
          return;
        }
        if (!selectedStock.warehouseId) {
          showNotification('Seçilen kayıt için depo bilgisi bulunamadı', 'error');
          return;
        }
      }
      
      const request = {
        productId: parseInt(id!),
        ...(sendStockItemId
          ? { stockItemId: Number(assignmentForm.selectedStockItemId) }
          : {
              quantity: assignmentForm.quantity || 1,
              warehouseId: selectedStock.warehouseId,
            }),
        expectedReturnDate: assignmentForm.expectedReturnDate || undefined,
        notes: assignmentForm.notes || undefined,
        ...(assignmentForm.assignmentType === 'user' ? {
          assignedUserId: parseInt(assignmentForm.assignedUserId),
          assignedSchoolId: assignmentForm.assignedSchoolId ? parseInt(assignmentForm.assignedSchoolId) : undefined
        } : {
          assignedLocationId: parseInt(assignmentForm.assignedLocationId),
          locationDetails: assignmentForm.locationDetails || undefined
        })
      };

      const createResult = await assignmentService.createAssignment(request);
      const createdAssignment = createResult.data && !Array.isArray(createResult.data)
        ? createResult.data
        : null;

      if (createdAssignment?.id) {
        try {
          if (assignmentFormPhotoFile) {
            await assignmentService.uploadFormPhoto(createdAssignment.id, assignmentFormPhotoFile);
          }
          await assignmentService.downloadAssignmentForm(createdAssignment.id);
          await Promise.all([loadAssignments(), loadStockItems()]);
          showNotification(
            assignmentFormPhotoFile
              ? 'Zimmet oluşturuldu. Fotoğraf forma eklendi; imzalı halini yükleyebilirsiniz.'
              : 'Zimmet oluşturuldu. Form indirildi; imzalı halini yükleyebilirsiniz.',
            'success'
          );
        } catch (err: unknown) {
          await Promise.all([loadAssignments(), loadStockItems()]);
          showNotification(
            err instanceof Error ? err.message : 'Zimmet oluşturuldu ancak fotoğraf/form işlemi tamamlanamadı.',
            'error'
          );
        }
      } else {
        await Promise.all([loadAssignments(), loadStockItems()]);
      }
      
      // Modal'ı kapat ve formu sıfırla
      setShowAssignmentModal(false);
      if (assignmentFormPhotoPreview) {
        URL.revokeObjectURL(assignmentFormPhotoPreview);
      }
      setAssignmentFormPhotoFile(null);
      setAssignmentFormPhotoPreview(null);
      setAssignmentForm({
        assignmentType: 'user',
        selectedStockItemId: '',
        expectedReturnDate: '',
        notes: '',
        assignedUserId: '',
        assignedSchoolId: '',
        assignedLocationId: '',
        locationDetails: '',
        quantity: 1
      });
      
      // Arama terimini de sıfırla
      setUserSearchTerm('');
      setFilteredUsers(users);
      
      if (!createdAssignment?.id) {
        showNotification(`Zimmet başarıyla oluşturuldu! ${assignmentForm.quantity || 1} adet depodan çıkış yapıldı.`, 'success');
      }
    } catch (err: any) {
      console.error('Error creating assignment:', err);
      showNotification('Zimmet oluşturulurken hata oluştu', 'error');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleRemoveSupplier = async (supplierId: number) => {
    if (!window.confirm('Bu tedarikçiyi üründen kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setError(null);
      await productService.removeSupplierFromProduct(parseInt(id!), supplierId);
      await loadProductData();
    } catch (err) {
      console.error('Error removing supplier:', err);
      setError('Tedarikçi kaldırılırken hata oluştu');
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500">Ürün bulunamadı</p>
              </div>
            )}
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="mt-2 flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.active ? 'Aktif' : 'Pasif'}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Kod: {product.code}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Geri
              </button>
              {canInventoryManage && (
                <button
                  onClick={() => navigate(`/products/edit/${product.id}`)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Düzenle
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Ürün Detayları</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Açıklama</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.category?.name} [{product.category?.code}]
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ürün Tipi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.productType ? 
                      (PRODUCT_TYPE_LABELS[product.productType]?.label || product.productType) 
                      : 'Belirtilmemiş'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Birim</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.unitOfMeasure}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Minimum Miktar</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.minQuantity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Maksimum Miktar</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.maxQuantity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tahmini Birim Fiyat</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.estimatedUnitPrice?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Depo Stokları — ürün detayının hemen altında */}
          {usesSerialItems ? (
            product && (
              <SerialStockItemSection
                productId={product.id}
                stockItems={stockItems}
                loading={stockItemsLoading}
                canManage={canInventoryManage}
                onRefresh={() => {
                  loadStockItems();
                  loadAssignments();
                  loadProductData();
                }}
                onImageClick={(url) => setSelectedImage(url)}
              />
            )
          ) : (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Depo Stokları</h3>
                <p className="mt-1 text-sm text-gray-500">Bu ürüne ait depo stok bilgileri</p>
              </div>
              <div className="border-t border-gray-200">
                {stockItemsLoading ? (
                  <div className="px-4 py-8 sm:px-6">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                    </div>
                  </div>
                ) : stockItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Miktar
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Depo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Atanan Kişi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Resim
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stockItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.notes || `${item.currentStock ?? 0} adet`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {item.assetConditionName || item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.warehouseName || 'Atanmamış'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.assignedUserName || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.imageUrl ? (
                                <button onClick={() => setSelectedImage(item.imageUrl!)} className="block">
                                  <img
                                    src={item.imageUrl}
                                    alt="Ürün resmi"
                                    className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                  />
                                </button>
                              ) : (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-4 py-8 sm:px-6">
                    <p className="text-sm text-gray-500 text-center">
                      {isConsumable
                        ? 'Bu ürüne ait depo stok bilgisi bulunamadı. Aşağıdan manuel stok girişi yapabilirsiniz.'
                        : 'Bu ürüne ait stok kalemi bulunamadı.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {product && (
            <ProductStockMovementSection
              productId={product.id}
              productType={product.productType}
              onStockChanged={() => {
                loadStockItems();
                loadAssignments();
                loadProductData();
              }}
            />
          )}

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Satın alma talepleri</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bu ürünün kalemi olarak yer aldığı onaylı veya süreçteki talepler
              </p>
            </div>
            <div className="border-t border-gray-200">
              {procurementLoading ? (
                <div className="px-4 py-6 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                </div>
              ) : procurement?.purchaseRequests && procurement.purchaseRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Talep</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {procurement.purchaseRequests.map((row) => (
                        <tr key={row.requestItemId}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{requestStatusLabel(row.status)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.quantity ?? '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.requestCreatedAt ? formatDate(row.requestCreatedAt) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <button
                              type="button"
                              onClick={() => navigate(`/purchase-requests/${row.requestId}`)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Detay
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-4 py-4 text-sm text-gray-500">Bu ürünle ilişkili satın alma talebi bulunamadı.</p>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Siparişler</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bu ürün kalemi üzerinden oluşturulan siparişler
              </p>
            </div>
            <div className="border-t border-gray-200">
              {procurementLoading ? (
                <div className="px-4 py-6 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                </div>
              ) : procurement?.purchaseOrders && procurement.purchaseOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {procurement.purchaseOrders.map((row) => (
                        <tr key={row.orderId}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.orderCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{orderStatusLabel(row.status)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.quantity ?? '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.totalPrice != null
                              ? Number(row.totalPrice).toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: row.currency || 'TRY',
                                })
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.createdAt ? formatDate(row.createdAt) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <button
                              type="button"
                              onClick={() => navigate(`/purchase-orders/${row.orderId}`)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Detay
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-4 py-4 text-sm text-gray-500">Bu ürünle ilişkili sipariş bulunamadı.</p>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Tedarikçiler</h3>
              <button
                onClick={() => navigate(`/products/${product.id}/suppliers/add`)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Tedarikçi Ekle
              </button>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {product.suppliers && product.suppliers.length > 0 ? (
                  product.suppliers.map((supplier, index) => (
                    <li key={index} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {supplier.name || `Tedarikçi ${index + 1}`}
                        </div>
                        <button
                          onClick={() => handleRemoveSupplier(supplier.id || index)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Kaldır
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-gray-500">Henüz tedarikçi eklenmemiş.</p>
                  </li>
                )}
              </ul>
            </div>
          </div>

        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Zimmetler</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bu ürüne ait zimmet kayıtları
            </p>
          </div>
          <button
            onClick={() => {
              if (!product?.canAssign) return;
              setShowAssignmentModal(true);
              loadStockItems();
              loadUsers();
              loadSchools();
              loadLocations();
              setUserSearchTerm('');
              setFilteredUsers([]);
            }}
            disabled={!product?.canAssign}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zimmet Et
          </button>
        </div>
        {!product?.canAssign && (
          <div className="mx-4 mb-4 sm:mx-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-900">Zimmet şu an yapılamıyor</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {(product.assignBlockers?.length ? product.assignBlockers : ['Zimmet koşulları sağlanmıyor']).map(
                (reason) => (
                  <li key={reason}>{reason}</li>
                )
              )}
            </ul>
          </div>
        )}
        <div className="border-t border-gray-200">
          {assignmentsLoading ? (
            <div className="px-4 py-8 sm:px-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          ) : assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zimmet Tarihi
                    </th>
                    {usesSerialItems && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seri / cihaz
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atanan Kişi/Konum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miktar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beklenen İade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notlar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fotoğraf
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zimmet Formu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(assignment.assignmentDate)}
                      </td>
                      {usesSerialItems && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.serialNumber || (assignment.stockItemId ? `#${assignment.stockItemId}` : '—')}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.status === AssignmentStatus.ACTIVE 
                            ? 'bg-green-100 text-green-800' 
                            : assignment.status === AssignmentStatus.RETURNED
                            ? 'bg-blue-100 text-blue-800'
                            : assignment.status === AssignmentStatus.LOST
                            ? 'bg-red-100 text-red-800'
                            : assignment.status === AssignmentStatus.DAMAGED
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status === AssignmentStatus.ACTIVE && 'Aktif'}
                          {assignment.status === AssignmentStatus.RETURNED && 'İade Edildi'}
                          {assignment.status === AssignmentStatus.LOST && 'Kayıp'}
                          {assignment.status === AssignmentStatus.DAMAGED && 'Hasarlı'}
                          {assignment.status === AssignmentStatus.EXPIRED && 'Süresi Doldu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.userAssignment ? (
                          <div>
                            <div className="font-medium">{assignment.assignedUserName || 'Bilinmeyen Kullanıcı'}</div>
                            {assignment.assignedSchoolName && (
                              <div className="text-gray-500 text-xs">{assignment.assignedSchoolName}</div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">{assignment.assignedLocationName || 'Bilinmeyen Konum'}</div>
                            {assignment.locationDetails && (
                              <div className="text-gray-500 text-xs">{assignment.locationDetails}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.expectedReturnDate ? formatDate(assignment.expectedReturnDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AssignmentFormPhotoThumb
                          assignmentId={assignment.id}
                          hasFormPhoto={assignment.hasFormPhoto}
                          formPhotoUrl={assignment.formPhotoUrl}
                          onImageClick={(url) => setSelectedImage(url)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleDownloadAssignmentForm(assignment.id)}
                            disabled={formDownloadingId === assignment.id}
                            className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 text-left"
                          >
                            {formDownloadingId === assignment.id ? 'İndiriliyor…' : 'Formu indir'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUploadFormPhotoClick(assignment.id)}
                            disabled={formPhotoUploadingId === assignment.id}
                            className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 text-left"
                          >
                            {formPhotoUploadingId === assignment.id
                              ? 'Fotoğraf yükleniyor…'
                              : assignment.hasFormPhoto
                                ? 'Fotoğrafı değiştir'
                                : 'Fotoğraf yükle'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUploadSignedFormClick(assignment.id)}
                            disabled={signedFormUploadingId === assignment.id}
                            className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 text-left"
                          >
                            {signedFormUploadingId === assignment.id ? 'Yükleniyor…' : 'İmzalı yükle'}
                          </button>
                          {assignment.hasSignedForm && (
                            <button
                              type="button"
                              onClick={() => handleDownloadSignedForm(assignment.id)}
                              disabled={formDownloadingId === assignment.id}
                              className="text-green-700 hover:text-green-900 disabled:opacity-50 text-left"
                            >
                              İmzalı indir
                            </button>
                          )}
                          {assignment.canBeReturned && (
                            <button
                              type="button"
                              onClick={() => setReturnTargetAssignment(assignment)}
                              disabled={returningAssignment}
                              className="text-emerald-700 hover:text-emerald-900 disabled:opacity-50 text-left"
                            >
                              İade et
                            </button>
                          )}
                          {canCancelAssignment(assignment) && (
                            <button
                              type="button"
                              onClick={() => handleCancelAssignment(assignment.id)}
                              disabled={assignmentCancellingId === assignment.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 text-left"
                            >
                              {assignmentCancellingId === assignment.id ? 'İptal ediliyor…' : 'Zimmeti iptal et'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <input
                ref={signedFormInputRef}
                type="file"
                accept=".xlsx,.pdf,image/*"
                className="hidden"
                onChange={handleSignedFormSelected}
              />
              <input
                ref={formPhotoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleFormPhotoSelected}
              />
            </div>
          ) : (
            <div className="px-4 py-8 sm:px-6">
              <p className="text-sm text-gray-500 text-center">
                Bu ürüne ait zimmet kaydı bulunamadı.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>

      {/* Zimmet Modal */}
      {showAssignmentModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAssignmentModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Zimmet Oluştur - {product?.name}
                      </h3>
                      <button
                        onClick={() => setShowAssignmentModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {usesQuantityForZimmet ? 'Depo seçimi *' : 'Cihaz seçimi *'}
                        </label>
                        {usesQuantityForZimmet ? (
                            // Sarf malzemeleri için depo seçimi ve miktar
                            <div className="space-y-2">
                              <select 
                                value={assignmentForm.selectedStockItemId}
                                onChange={(e) => setAssignmentForm({...assignmentForm, selectedStockItemId: e.target.value})}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              >
                                <option value="">Depo seçin</option>
                                {assignableForZimmet.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.warehouseName || 'Depo belirtilmemiş'}
                                    {' · '}
                                    Stok: {item.currentStock ?? parseStockQuantityFromNotes(item.notes)}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                name="quantity"
                                min="1"
                                max={(() => {
                                  const selectedStock = stockItems.find(
                                    (item) => item.id.toString() === assignmentForm.selectedStockItemId
                                  );
                                  if (!selectedStock) return 1;
                                  return (selectedStock.currentStock ?? parseStockQuantityFromNotes(selectedStock.notes)) || 1;
                                })()}
                                value={assignmentForm.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  const max = (() => {
                                    const selectedStock = stockItems.find(
                                      (item) => item.id.toString() === assignmentForm.selectedStockItemId
                                    );
                                    if (!selectedStock) return 1;
                                    return (selectedStock.currentStock ?? parseStockQuantityFromNotes(selectedStock.notes)) || 1;
                                  })();
                                  
                                  // Maksimum stok miktarını aşmayacak şekilde sınırla
                                  const limitedValue = Math.min(value, max);
                                  setAssignmentForm({...assignmentForm, quantity: limitedValue});
                                }}
                                placeholder="Miktar"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              />
                              {(() => {
                                const selectedStock = stockItems.find(
                                  (item) => item.id.toString() === assignmentForm.selectedStockItemId
                                );
                                if (!selectedStock) return null;
                                const maxStock =
                                  selectedStock.currentStock ?? parseStockQuantityFromNotes(selectedStock.notes);
                                return (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Maksimum zimmet edilebilir: <span className="font-medium">{maxStock}</span> adet
                                  </p>
                                );
                              })()}
                            </div>
                          ) : (
                            <select
                              value={assignmentForm.selectedStockItemId}
                              onChange={(e) =>
                                setAssignmentForm({ ...assignmentForm, selectedStockItemId: e.target.value })
                              }
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              required
                            >
                              <option value="">Cihaz seçin</option>
                              {assignableForZimmet.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.warehouseName || 'Depo atanmamış'}
                                  {item.serialNumber ? ` · SN: ${item.serialNumber}` : ''}
                                  {item.assetLabel ? ` · ${item.assetLabel}` : ''}
                                </option>
                              ))}
                            </select>
                          )}
                        {assignableForZimmet.length === 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            {usesQuantityForZimmet
                              ? 'Stokta ürün bulunan depo yok. Önce manuel stok girişi yapın.'
                              : 'Zimmete uygun hazır cihaz yok. Durumu Hazır yapın ve depoya giriş yapın.'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zimmet Tipi
                        </label>
                        <select 
                          value={assignmentForm.assignmentType}
                          onChange={(e) => setAssignmentForm({...assignmentForm, assignmentType: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="user">Kişi Zimmeti</option>
                          <option value="location">Konum Zimmeti</option>
                        </select>
                      </div>

                      {assignmentForm.assignmentType === 'user' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kullanıcı *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={assignmentForm.assignedUserId 
                                  ? `${users.find(u => u.id.toString() === assignmentForm.assignedUserId)?.firstName} ${users.find(u => u.id.toString() === assignmentForm.assignedUserId)?.lastName} (${users.find(u => u.id.toString() === assignmentForm.assignedUserId)?.email})`
                                  : userSearchTerm
                                }
                                onChange={(e) => {
                                  if (assignmentForm.assignedUserId) {
                                    // Eğer kullanıcı seçiliyse ve input değişiyorsa, seçimi temizle
                                    setAssignmentForm({...assignmentForm, assignedUserId: ''});
                                    setUserSearchTerm(e.target.value);
                                  } else {
                                    // Normal arama
                                    handleUserSearch(e.target.value);
                                  }
                                }}
                                placeholder="Kullanıcı ara (ad, soyad veya email)..."
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              {userSearchTerm && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                  {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                      <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => {
                                          setAssignmentForm({...assignmentForm, assignedUserId: user.id.toString()});
                                          // Kullanıcı seçildikten sonra arama terimini temizle ve listeyi kapat
                                          setUserSearchTerm('');
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                      >
                                        {user.firstName} {user.lastName} ({user.email})
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-2 text-sm text-gray-500">
                                      Kullanıcı bulunamadı
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {assignmentForm.assignedUserId && (
                              <div className="mt-2 text-sm text-gray-600">
                                Seçilen: {filteredUsers.find(u => u.id.toString() === assignmentForm.assignedUserId)?.firstName} {filteredUsers.find(u => u.id.toString() === assignmentForm.assignedUserId)?.lastName}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Okul
                            </label>
                            <select 
                              value={assignmentForm.assignedSchoolId}
                              onChange={(e) => setAssignmentForm({...assignmentForm, assignedSchoolId: e.target.value})}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">Okul Seçin (Opsiyonel)</option>
                              {schools.map(school => (
                                <option key={school.id} value={school.id}>
                                  {school.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Konum *
                            </label>
                            <select 
                              value={assignmentForm.assignedLocationId}
                              onChange={(e) => setAssignmentForm({...assignmentForm, assignedLocationId: e.target.value})}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              required
                            >
                              <option value="">Konum Seçin</option>
                              {locations.map(location => (
                                <option key={location.id} value={location.id}>
                                  {location.name} - {location.description}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Konum Detayları
                            </label>
                            <input
                              type="text"
                              value={assignmentForm.locationDetails}
                              onChange={(e) => setAssignmentForm({...assignmentForm, locationDetails: e.target.value})}
                              placeholder="Örn: 3. Kat, Raf A-5, Masada"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </>
                      )}



                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beklenen İade Tarihi
                        </label>
                        <input
                          type="date"
                          value={assignmentForm.expectedReturnDate}
                          onChange={(e) => setAssignmentForm({...assignmentForm, expectedReturnDate: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notlar
                        </label>
                        <textarea
                          rows={3}
                          value={assignmentForm.notes}
                          onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                          placeholder="Zimmet hakkında notlar..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ürün fotoğrafı (form F8 hücresi)
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setAssignmentFormPhotoFile(file);
                            if (assignmentFormPhotoPreview) {
                              URL.revokeObjectURL(assignmentFormPhotoPreview);
                            }
                            setAssignmentFormPhotoPreview(file ? URL.createObjectURL(file) : null);
                          }}
                        />
                        {assignmentFormPhotoPreview && (
                          <img
                            src={assignmentFormPhotoPreview}
                            alt="Seçilen ürün fotoğrafı"
                            className="mt-2 h-20 w-20 rounded object-cover border border-gray-200"
                          />
                        )}
                      </div>

                      {/* Bilgilendirici Kutu */}
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Zimmet Bilgisi
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                {product?.productType === 'CONSUMABLE' || product?.productType === 'Sarf Malzemesi' || (typeof product?.productType === 'string' && product?.productType.includes('Sarf'))
                                  ? 'Sarf malzemesi zimmeti yapıldığında, seçilen depodan belirtilen miktar otomatik olarak çıkış yapılacak ve stok miktarı güncellenecektir. ✅'
                                  : 'Demirbaş ürün zimmeti yapıldığında, seçilen stock item\'ın durumu "Atanmış" olarak güncellenecektir.'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCreateAssignment}
                  disabled={assignmentLoading || !assignmentForm.selectedStockItemId || (assignmentForm.assignmentType === 'user' && !assignmentForm.assignedUserId) || (assignmentForm.assignmentType === 'location' && !assignmentForm.assignedLocationId)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignmentLoading ? 'Oluşturuluyor...' : 'Zimmet Oluştur'}
                </button>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resim Modal */}
      {selectedImage && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedImage(null)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Ürün Resmi
                      </h3>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <img 
                        src={selectedImage} 
                        alt="Büyük ürün resmi"
                        className="max-w-full max-h-96 object-contain rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AssignmentReturnModal
        isOpen={Boolean(returnTargetAssignment)}
        assignment={returnTargetAssignment}
        submitting={returningAssignment}
        onClose={() => {
          if (!returningAssignment) setReturnTargetAssignment(null);
        }}
        onSubmit={handleReturnAssignment}
      />
    </div>
  );
}; 