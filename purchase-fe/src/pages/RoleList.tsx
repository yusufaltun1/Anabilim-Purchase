import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { roleService } from '../services/role.service';
import { Role } from '../types/role';

export const RoleList = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'system' | 'custom'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadRoles();
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [filter, location.state]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      let data: Role[];
      
      if (filter === 'active') {
        data = await roleService.getActiveRoles();
      } else if (filter === 'system') {
        data = await roleService.getSystemRoles();
      } else {
        data = await roleService.getAllRoles();
      }
      
      console.log('Loaded roles:', data);
      setRoles(data);
    } catch (err) {
      setError('Roller yüklenirken hata oluştu');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    navigate('/roles/create');
  };

  const handleEditRole = (id: number) => {
    navigate(`/roles/edit/${id}`);
  };

  const handleDeleteRole = async (id: number) => {
    if (window.confirm('Bu rolü silmek istediğinizden emin misiniz?')) {
      try {
        await roleService.deleteRole(id);
        setRoles(roles.filter(r => r.id !== id));
        setSuccessMessage('Rol başarıyla silindi!');
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (err) {
        setError('Rol silinirken hata oluştu');
        console.error('Error deleting role:', err);
      }
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    console.log('Filtering role:', role, 'Matches search:', matchesSearch);
    
    if (filter === 'active') {
      return matchesSearch && role.isActive;
    } else if (filter === 'system') {
      return matchesSearch && role.isSystemRole;
    } else if (filter === 'custom') {
      return matchesSearch && !role.isSystemRole;
    }
    
    return matchesSearch;
  });

  console.log('Filtered roles:', filteredRoles);

  const getRoleStatusBadge = (role: Role) => {
    if (!role.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Pasif
        </span>
      );
    }
    
    if (role.isSystemRole) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Sistem
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Aktif
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roller</h1>
              <p className="mt-2 text-gray-600">
                Sistemdeki tüm rolleri yönetin
              </p>
            </div>
            <button
              onClick={handleCreateRole}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Yeni Rol</span>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-4 sm:px-0 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="text-green-400 hover:text-green-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Arama
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rol adı, görünen ad veya açıklama ara..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtre
                </label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'system' | 'custom')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tümü</option>
                  <option value="active">Aktif</option>
                  <option value="system">Sistem Rolleri</option>
                  <option value="custom">Özel Roller</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
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
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Rol bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Arama kriterlerinize uygun rol bulunamadı.' 
                  : 'Henüz hiç rol oluşturulmamış.'
                }
              </p>
              {!searchTerm && filter === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={handleCreateRole}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    İlk Rolü Oluştur
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map((role) => (
                <div key={role.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          role.isSystemRole ? 'bg-blue-100' : role.isActive ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <svg className={`w-5 h-5 ${role.isSystemRole ? 'text-blue-600' : role.isActive ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">{role.displayName}</h3>
                          {getRoleStatusBadge(role)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rol Adı:</span>
                        <span className="font-medium text-gray-900 font-mono">{role.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tip:</span>
                        <span className="font-medium text-gray-900">
                          {role.isSystemRole ? 'Sistem Rolü' : 'Özel Rol'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Durum:</span>
                        <span className="font-medium text-gray-900">
                          {role.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      {role.permissions && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">İzinler:</span>
                          <span className="font-medium text-gray-900">{role.permissions.length}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{role.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEditRole(role.id!)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Düzenle
                      </button>
                      {!role.isSystemRole && (
                        <button
                          onClick={() => handleDeleteRole(role.id!)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 