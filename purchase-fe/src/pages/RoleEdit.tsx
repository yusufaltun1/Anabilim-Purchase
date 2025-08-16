import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { roleService } from '../services/role.service';
import { Role, UpdateRoleRequest } from '../types/role';

export const RoleEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    isActive: true,
    isSystemRole: false,
  });
  
  const [originalData, setOriginalData] = useState<Role | null>(null);

  useEffect(() => {
    if (id) {
      loadRole(parseInt(id));
    }
  }, [id]);

  const loadRole = async (roleId: number) => {
    try {
      setLoading(true);
      const role = await roleService.getRoleById(roleId);
      
      setOriginalData(role);
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
      });
    } catch (err) {
      setError('Rol yüklenirken hata oluştu');
      console.error('Error loading role:', err);
    } finally {
      setLoading(false);
    }
  };

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
    
    if (!validateForm() || !id) {
      return;
    }
    
    setSaving(true);
    
    try {
      const roleData: UpdateRoleRequest = {
        id: parseInt(id),
        name: formData.name.trim().toUpperCase(),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        isSystemRole: formData.isSystemRole,
      };
      
      await roleService.updateRole(parseInt(id), roleData);
      navigate('/roles', { 
        state: { message: 'Rol başarıyla güncellendi!' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rol güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      const hasChanges = 
        formData.name !== originalData.name ||
        formData.displayName !== originalData.displayName ||
        formData.description !== originalData.description ||
        formData.isActive !== originalData.isActive ||
        formData.isSystemRole !== originalData.isSystemRole;
      
      if (hasChanges) {
        if (window.confirm('Değişiklikleriniz kaydedilmeyecek. Devam etmek istiyor musunuz?')) {
          navigate('/roles');
        }
      } else {
        navigate('/roles');
      }
    } else {
      navigate('/roles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error && !originalData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                <div className="mt-2">
                  <button
                    onClick={() => navigate('/roles')}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    ← Rol listesine dön
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rol Düzenle</h1>
              <p className="mt-2 text-gray-600">
                "{originalData?.displayName}" rolünü düzenleyin
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
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
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
                  disabled={originalData?.isSystemRole}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="isSystemRole" className="ml-2 block text-sm text-gray-900">
                  Sistem Rolü
                </label>
                <p className="ml-2 text-sm text-gray-500">
                  Sistem rolleri silinemez ve özel izinlere sahiptir
                  {originalData?.isSystemRole && (
                    <span className="text-red-600 font-medium"> (Bu rol zaten sistem rolüdür)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Role Information */}
          {originalData && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rol Bilgileri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Oluşturulma Tarihi:</span>
                  <p className="text-sm text-gray-900">
                    {originalData.createdAt ? new Date(originalData.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Son Güncelleme:</span>
                  <p className="text-sm text-gray-900">
                    {originalData.updatedAt ? new Date(originalData.updatedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                  </p>
                </div>
                
                {originalData.permissions && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-500">Mevcut İzinler:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {originalData.permissions.length > 0 ? (
                        originalData.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {permission}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Henüz izin atanmamış</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Information Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Rol Düzenleme Hakkında</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Rol adı benzersiz olmalıdır ve sadece büyük harfler ve alt çizgi içerebilir</li>
                    <li>Sistem rolleri oluşturulduktan sonra sistem rolü özelliği değiştirilemez</li>
                    <li>Pasif roller kullanıcılara atanamaz</li>
                    <li>Rol izinleri ayrı bir sayfadan yönetilebilir</li>
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