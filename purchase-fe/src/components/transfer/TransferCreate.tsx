import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { AssetTransferService } from '../../services/asset-transfer.service';
import { CreateTransferRequest, TransferItem } from '../../types/asset-transfer';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { warehouseService } from '../../services/warehouse.service';
import { schoolService } from '../../services/school.service';
import { productService } from '../../services/product.service';
import { Warehouse } from '../../types/warehouse';
import { School } from '../../types/school';
import { Product } from '../../types/product';
import { WarehouseStock } from '../../types/warehouse';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const TransferCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [formData, setFormData] = useState<CreateTransferRequest>({
    sourceWarehouseId: 0,
    targetSchoolId: 0,
    transferDate: '',
    notes: '',
    items: []
  });

  const [errors, setErrors] = useState<{
    sourceWarehouseId?: string;
    targetSchoolId?: string;
    transferDate?: string;
    items?: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [warehouseData, schoolData, productData] = await Promise.all([
          warehouseService.getActiveWarehouses(),
          schoolService.getActiveSchools(),
          productService.getActiveProducts()
        ]);
        setWarehouses(warehouseData);
        setSchools(schoolData);
        setProducts(Array.isArray(productData.data) ? productData.data : []);
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
    if (!formData.targetSchoolId) {
      newErrors.targetSchoolId = 'Hedef okul seçilmeli';
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
      if (stock && item.requestedQuantity > stock.currentStock) {
        if (!newErrors.items) newErrors.items = '';
        newErrors.items += `Ürün #${index + 1}: Stok miktarı yetersiz. Mevcut stok: ${stock.currentStock}\n`;
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
          conditionNotes: ''
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
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Yeni Transfer Oluştur</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
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
                      Hedef Okul
                    </label>
                    <select
                      className={`w-full border rounded-lg p-2 ${errors.targetSchoolId ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.targetSchoolId}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetSchoolId: Number(e.target.value) }))}
                    >
                      <option value="0">Okul Seçin</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                    {errors.targetSchoolId && (
                      <p className="mt-1 text-sm text-red-600">{errors.targetSchoolId}</p>
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
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Transfer Ürünleri</h2>
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                            {warehouseStocks.map((stock) => (
                              <option key={stock.product.id} value={stock.product.id}>
                                {stock.product.name} (Stok: {stock.currentStock} {stock.product.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Miktar
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={warehouseStocks.find(s => s.product.id === item.productId)?.currentStock || 1}
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
                        </div>

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