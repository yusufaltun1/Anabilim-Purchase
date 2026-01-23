import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { AssetTransferService } from '../../services/asset-transfer.service';
import { CreateTransferRequest, TransferItem } from '../../types/asset-transfer';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { warehouseService } from '../../services/warehouse.service';
import { userService } from '../../services/user.service';
import { productService } from '../../services/product.service';
import { Warehouse } from '../../types/warehouse';
import { User } from '../../types/user';
import { Product, ProductType, getProductTypeFromLabel } from '../../types/product';
import { WarehouseStock } from '../../types/warehouse';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const TransferCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [formData, setFormData] = useState<CreateTransferRequest>({
    sourceWarehouseId: 0,
    targetWarehouseId: 0,
    selfManaged: false,
    receiverUserId: null,
    transferDate: '',
    notes: '',
    items: []
  });

  const [errors, setErrors] = useState<{
    sourceWarehouseId?: string;
    targetWarehouseId?: string;
    receiverUserId?: string;
    transferDate?: string;
    items?: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading initial data...');
        const [warehouseData, productData, activeUsersResponse] = await Promise.all([
          warehouseService.getActiveWarehouses(),
          productService.getActiveProducts(),
          userService.getActiveUsers()
        ]);
        console.log('Warehouse data:', warehouseData);
        console.log('Product data:', productData);
        
        setWarehouses(warehouseData);
        setUsers(Array.isArray(activeUsersResponse.data) ? activeUsersResponse.data : []);
        
        // Product data artık direkt array olarak geliyor
        setProducts(productData);
      } catch (error) {
        console.error('Error loading data:', error);
        // TODO: Show error notification
      }
    };

    loadData();
  }, []);

  // Fetch warehouse stocks when warehouse is selected
  useEffect(() => {
    const loadWarehouseStocks = async () => {
      if (formData.sourceWarehouseId > 0) {
        try {
          const stocks = await warehouseService.getWarehouseStocks(formData.sourceWarehouseId);
          setWarehouseStocks(stocks);
        } catch (error) {
          console.error('Error loading warehouse stocks:', error);
          // TODO: Show error notification
        }
      } else {
        setWarehouseStocks([]);
      }
    };

    loadWarehouseStocks();
  }, [formData.sourceWarehouseId]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.sourceWarehouseId) {
      newErrors.sourceWarehouseId = 'Kaynak depo seçilmeli';
    }
    if (!formData.targetWarehouseId) {
      newErrors.targetWarehouseId = 'Hedef depo seçilmeli';
    }
    if (!formData.selfManaged && !formData.receiverUserId) {
      newErrors.receiverUserId = 'Alıcı kullanıcı seçilmeli';
    }
    if (!formData.transferDate) {
      newErrors.transferDate = 'Transfer tarihi seçilmeli';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'En az bir ürün eklenmelidir';
    }

    // Validate stock availability
    formData.items.forEach((item, index) => {
      const stock = warehouseStocks.find(s => s.product.id === item.productId);
      const product = products.find(p => p.id === item.productId);
      if (stock && item.requestedQuantity > stock.currentStock) {
        if (!newErrors.items) newErrors.items = '';
        newErrors.items += `Ürün #${index + 1}: Stok miktarı yetersiz. Mevcut stok: ${stock.currentStock}\n`;
      }
      if (requiresSerialNumber(product) && !item.serialNumbers?.trim()) {
        if (!newErrors.items) newErrors.items = '';
        newErrors.items += `Ürün #${index + 1}: Seri numarası girilmelidir.\n`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await AssetTransferService.createTransfer(formData);
      navigate('/transfers'); // Navigate to transfers list after successful creation
    } catch (error) {
      console.error('Error creating transfer:', error);
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: 0,
          requestedQuantity: 1,
          notes: '',
          serialNumbers: '',
          conditionNotes: '',
          transferImagesBase64: [],
          receiveImagesBase64: null
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof TransferItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const nextItem = { ...item, [field]: value };
          if (field === 'productId') {
            const nextProduct = products.find(product => product.id === value);
            if (!requiresSerialNumber(nextProduct)) {
              nextItem.serialNumbers = '';
            }
          }
          return nextItem;
        }
        return item;
      })
    }));
  };

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const handleTransferImagesChange = async (index: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, i) => (
          i === index ? { ...item, transferImagesBase64: [] } : item
        ))
      }));
      return;
    }

    const files = Array.from(fileList);
    const base64List = await Promise.all(files.map(fileToBase64));

    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => (
        i === index ? { ...item, transferImagesBase64: base64List, receiveImagesBase64: null } : item
      ))
    }));
  };

  const normalizeProductType = (value?: string | ProductType): ProductType | null => {
    if (!value) return null;
    const rawValue = typeof value === 'string' ? value : String(value);
    const trimmed = rawValue.trim();
    const match = (Object.values(ProductType) as string[]).find((type) => type.trim() === trimmed);
    return match ? (match as ProductType) : null;
  };

  const getProductTypeKey = (product?: Product): ProductType => {
    if (!product?.productType) return ProductType.CONSUMABLE;
    if (typeof product.productType === 'string') {
      const normalized = normalizeProductType(product.productType);
      return normalized ?? getProductTypeFromLabel(product.productType);
    }
    return product.productType ?? ProductType.CONSUMABLE;
  };

  const requiresSerialNumber = (product?: Product): boolean => {
    const productType = getProductTypeKey(product);
    return [ProductType.FIXED_ASSET, ProductType.SEMI_FIXED_ASSET].includes(productType);
  };

  const filteredUsers = users.filter((user) => {
    if (!userQuery.trim()) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const query = userQuery.trim().toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const selectedUser = users.find(user => user.id === formData.receiverUserId) || null;
  const userInputValue = userQuery || (selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})` : '');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Yeni Transfer Oluştur</h1>
              <p className="text-sm text-gray-500 mt-1">Kaynak ve hedef depo bilgilerini girin, alıcıyı seçin.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Transfer Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kaynak Depo
                    </label>
                    <select
                      className={`w-full border rounded-lg p-2 ${errors.sourceWarehouseId ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.sourceWarehouseId}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceWarehouseId: Number(e.target.value) }))}
                    >
                      <option value="0">Depo Seçin</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                    {errors.sourceWarehouseId && (
                      <p className="mt-1 text-sm text-red-600">{errors.sourceWarehouseId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hedef Depo
                    </label>
                    <select
                      className={`w-full border rounded-lg p-2 ${errors.targetWarehouseId ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.targetWarehouseId}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetWarehouseId: Number(e.target.value) }))}
                    >
                      <option value="0">Depo Seçin</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                    {errors.targetWarehouseId && (
                      <p className="mt-1 text-sm text-red-600">{errors.targetWarehouseId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transfer Tarihi
                    </label>
                    <input
                      type="date"
                      className={`w-full border rounded-lg p-2 ${errors.transferDate ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.transferDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                    />
                    {errors.transferDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.transferDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notlar
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-2"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={formData.selfManaged}
                        onChange={(e) => {
                          const isSelfManaged = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            selfManaged: isSelfManaged,
                            receiverUserId: isSelfManaged ? null : prev.receiverUserId
                          }));
                        }}
                      />
                      Kendim yöneteceğim
                    </label>
                    <p className="text-xs text-gray-500 mt-1">İşaretlerseniz alıcı kullanıcı seçimi zorunlu olmaz.</p>
                  </div>

                  {!formData.selfManaged && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alıcı Kullanıcı
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full border rounded-lg p-2 ${errors.receiverUserId ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="İsim veya e‑posta ile ara ve seç..."
                          value={userInputValue}
                          onChange={(e) => {
                            setUserQuery(e.target.value);
                            setIsUserDropdownOpen(true);
                            setFormData(prev => ({ ...prev, receiverUserId: null }));
                          }}
                          onFocus={() => setIsUserDropdownOpen(true)}
                          onBlur={() => {
                            setTimeout(() => setIsUserDropdownOpen(false), 120);
                          }}
                        />
                        {isUserDropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
                            {filteredUsers.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Aramaya uygun kullanıcı bulunamadı</div>
                            ) : (
                              filteredUsers.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, receiverUserId: user.id ?? null }));
                                    setUserQuery(`${user.firstName} ${user.lastName} (${user.email})`);
                                    setIsUserDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{filteredUsers.length} kullanıcı</span>
                      </div>
                      {errors.receiverUserId && (
                        <p className="mt-1 text-sm text-red-600">{errors.receiverUserId}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Transfer Ürünleri</h2>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    onClick={handleAddItem}
                  >
                    <FaPlus className="inline-block mr-2" />
                    Ürün Ekle
                  </button>
                </div>

                {errors.items && (
                  <p className="mb-4 text-sm text-red-600">{errors.items}</p>
                )}

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-md font-medium">Ürün #{index + 1}</h3>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ürün
                          </label>
                          <select
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', Number(e.target.value))}
                          >
                            <option value="0">Ürün Seçin</option>
                            {products.map((product) => {
                              const stock = warehouseStocks.find(s => s.product.id === product.id);
                              const stockInfo = stock ? ` (Stok: ${stock.currentStock} ${product.unitOfMeasure})` : ' (Stok yok)';
                              return (
                                <option key={product.id} value={product.id}>
                                  {product.name}{stockInfo}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Miktar
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={warehouseStocks.find(s => s.product.id === item.productId)?.currentStock || 999999}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={item.requestedQuantity}
                            onChange={(e) => handleItemChange(index, 'requestedQuantity', Number(e.target.value))}
                          />
                          {warehouseStocks.find(s => s.product.id === item.productId) && (
                            <p className="mt-1 text-sm text-gray-500">
                              Mevcut Stok: {warehouseStocks.find(s => s.product.id === item.productId)?.currentStock} {warehouseStocks.find(s => s.product.id === item.productId)?.product.unit}
                            </p>
                          )}
                        </div>

                        {requiresSerialNumber(products.find(p => p.id === item.productId)) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Seri Numaraları
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-lg p-2"
                              value={item.serialNumbers}
                              onChange={(e) => handleItemChange(index, 'serialNumbers', e.target.value)}
                              placeholder="Örn: SN001-SN010"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Demirbaş ve yarı sabit kıymetlerde zorunludur.
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Durum Notları
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={item.conditionNotes}
                            onChange={(e) => handleItemChange(index, 'conditionNotes', e.target.value)}
                            placeholder="Örn: Yeni, hasarsız"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transfer Görselleri
                          </label>
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              onChange={(e) => handleTransferImagesChange(index, e.target.files)}
                            />
                            {(item.transferImagesBase64?.length ?? 0) > 0 && (
                              <button
                                type="button"
                                className="text-sm text-red-600 hover:text-red-800"
                                onClick={() => handleTransferImagesChange(index, null)}
                              >
                                Temizle
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {(item.transferImagesBase64?.length ?? 0) > 0
                              ? `${item.transferImagesBase64?.length} görsel seçildi`
                              : 'Henüz görsel seçilmedi'}
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notlar
                          </label>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg p-2"
                            rows={2}
                            value={item.notes}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => navigate('/transfers')}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCreate;