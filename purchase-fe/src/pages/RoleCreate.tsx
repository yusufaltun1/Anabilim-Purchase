import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { roleService } from '../services/role.service';
import { permissionService } from '../services/permission.service';
import { CreateRoleRequest } from '../types/role';
import { Permission } from '../types/permission';
import {
  OPERATION_LABELS,
  computeOperationsFromSelection,
  groupCatalogByResource,
  initialEmptySelection,
  mergeSelectionForOperation,
} from '../utils/role-permission-ui';

export const RoleCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [permCatalogLoading, setPermCatalogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permCatalog, setPermCatalog] = useState<Permission[]>([]);
  const [permissionSelection, setPermissionSelection] = useState<Record<string, boolean>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    isActive: true,
    isSystemRole: false,
  });
  const [operations, setOperations] = useState<Record<string, boolean>>(() =>
    computeOperationsFromSelection({})
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catalog = await permissionService.getAllPermissions();
        if (cancelled) return;
        const active = catalog.filter((p) => p.isActive !== false);
        setPermCatalog(active);
        let sel = initialEmptySelection(active);
        sel = mergeSelectionForOperation(sel, 'REQUEST_CREATE', true);
        sel = mergeSelectionForOperation(sel, 'REQUEST_VIEW', true);
        setPermissionSelection(sel);
        setOperations(computeOperationsFromSelection(sel));
      } catch (e) {
        console.error('Permission kataloğu yüklenemedi', e);
      } finally {
        if (!cancelled) setPermCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Rol adı gereklidir');
      return false;
    }
    
    if (!formData.displayName.trim()) {
      setError('Görünen ad gereklidir');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Açıklama gereklidir');
      return false;
    }
    
    // Validate role name format (uppercase with underscores)
    const nameRegex = /^[A-Z_]+$/;
    if (!nameRegex.test(formData.name)) {
      setError('Rol adı sadece büyük harfler ve alt çizgi içerebilir (örn: TEST_ROLE)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const roleData: CreateRoleRequest = {
        name: formData.name.trim().toUpperCase(),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        isSystemRole: formData.isSystemRole,
      };
      
      await roleService.createRole(roleData);
      const created = await roleService.getRoleByName(roleData.name);
      const selectedPermissionNames = new Set<string>();
      Object.entries(permissionSelection).forEach(([name, on]) => {
        if (on) selectedPermissionNames.add(name);
      });
      for (const permissionName of selectedPermissionNames) {
        try {
          await roleService.addPermissionToRole(created.id!, permissionName);
        } catch (e) {
          console.warn(`Permission atanamadı: ${permissionName}`, e);
        }
      }
      navigate('/roles', { 
        state: { message: 'Rol başarıyla oluşturuldu!' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rol oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.displayName || formData.description) {
      if (window.confirm('Değişiklikleriniz kaydedilmeyecek. Devam etmek istiyor musunuz?')) {
        navigate('/roles');
      }
    } else {
      navigate('/roles');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yeni Rol</h1>
              <p className="mt-2 text-gray-600">
                Yeni bir rol oluşturun ve özelliklerini tanımlayın
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || permCatalogLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {permCatalogLoading ? 'İzinler yükleniyor...' : loading ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 sm:px-0 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Temel Bilgiler</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Rol Adı *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  placeholder="Örn: TEST_ROLE"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Sadece büyük harfler ve alt çizgi kullanın
                </p>
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Görünen Ad *
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Örn: Test Rolü"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Bu rolün amacını ve kapsamını açıklayın"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Rol Ayarları</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Rol Aktif
                </label>
                <p className="ml-2 text-sm text-gray-500">
                  Aktif roller kullanıcılara atanabilir
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isSystemRole"
                  type="checkbox"
                  checked={formData.isSystemRole}
                  onChange={(e) => handleInputChange('isSystemRole', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isSystemRole" className="ml-2 block text-sm text-gray-900">
                  Sistem Rolü
                </label>
                <p className="ml-2 text-sm text-gray-500">
                  Sistem rolleri silinemez ve özel izinlere sahiptir
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">İşlem Yetkileri (özet)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OPERATION_LABELS.map((item) => (
                <label key={item.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!operations[item.key]}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setPermissionSelection((prev) => {
                        const next = mergeSelectionForOperation(prev, item.key, enabled);
                        setOperations(computeOperationsFromSelection(next));
                        return next;
                      });
                    }}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">{item.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Özet kutular tanımlı grupları işaretler. Yeni permission’lar için aşağıdaki tam listeyi kullanın.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Tüm permission’lar</h3>
            {permCatalogLoading ? (
              <p className="text-sm text-gray-500">Yükleniyor…</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Permissionlar ekranında oluşturduğunuz her kayıt burada görünür.
                </p>
                {Array.from(groupCatalogByResource(permCatalog).entries()).map(([resource, perms]) => (
                  <div key={resource} className="mb-6 last:mb-0">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{resource}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map((p) => (
                        <label key={p.name} className="flex items-start space-x-2 rounded border border-gray-100 p-2">
                          <input
                            type="checkbox"
                            checked={!!permissionSelection[p.name]}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setPermissionSelection((prev) => {
                                const next = { ...prev, [p.name]: checked };
                                setOperations(computeOperationsFromSelection(next));
                                return next;
                              });
                            }}
                            className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded shrink-0"
                          />
                          <span className="text-sm text-gray-800">
                            <span className="font-medium">{p.displayName || p.name}</span>
                            <span className="block text-xs text-gray-500 font-mono">{p.name}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Information Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Rol Oluşturma Hakkında</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Rol adı benzersiz olmalıdır ve sadece büyük harfler ve alt çizgi içerebilir</li>
                    <li>Sistem rolleri oluşturulduktan sonra silinemez</li>
                    <li>Pasif roller kullanıcılara atanamaz</li>
                    <li>Rol oluşturulduktan sonra izinler ayrıca eklenebilir</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 