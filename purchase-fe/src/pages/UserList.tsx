import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { userService } from '../services/user.service';
import { User } from '../types/user';

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User>('firstName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUsers();
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true });
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      if (Array.isArray(data)) {
        setUsers(data);
        setCurrentPage(1);
      } else {
        setUsers([]);
        setError('Beklenmeyen veri formatı');
      }
    } catch {
      setError('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (id: number) => navigate(`/users/${id}`);
  const handleEditUser = (id: number) => navigate(`/users/edit/${id}`);

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSuccessMessage('Kullanıcı başarıyla silindi!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setError('Kullanıcı silinirken hata oluştu');
    }
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hasActiveFilters = searchTerm || filter !== 'all' || departmentFilter || roleFilter;

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setDepartmentFilter('');
    setRoleFilter('');
    setCurrentPage(1);
  };

  const toSearchText = (value: unknown) => (value ?? '').toString().toLowerCase();
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      toSearchText(user.email).includes(normalizedSearchTerm) ||
      toSearchText(user.firstName).includes(normalizedSearchTerm) ||
      toSearchText(user.lastName).includes(normalizedSearchTerm) ||
      toSearchText(user.department).includes(normalizedSearchTerm) ||
      toSearchText(user.position).includes(normalizedSearchTerm);
    const matchesStatus = filter === 'all' || (filter === 'active' && user.isActive);
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;
    const matchesRole = !roleFilter || (user.roles ?? []).includes(roleFilter);
    return matchesSearch && matchesStatus && matchesDepartment && matchesRole;
  }).sort((a, b) => {
    if (sortField === 'roles') {
      const aV = a.roles.join(', ');
      const bV = b.roles.join(', ');
      return sortDirection === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
    }
    const aV = a[sortField]?.toString() || '';
    const bV = b[sortField]?.toString() || '';
    return sortDirection === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)));
  const roles = Array.from(new Set(users.flatMap(u => u.roles ?? [])));

  const SortIcon = ({ field }: { field: keyof User }) => (
    <span className="ml-1 text-gray-400">
      {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">

          {/* Başlık */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
              <p className="mt-1 text-sm text-gray-500">
                Toplam {users.length} kullanıcı
                {users.filter(u => u.isActive).length !== users.length && (
                  <span className="ml-2 text-green-600 font-medium">
                    ({users.filter(u => u.isActive).length} aktif)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate('/users/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Kullanıcı
            </button>
          </div>

          {/* Başarı mesajı */}
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-3">
              <svg className="h-5 w-5 text-green-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-800">{successMessage}</span>
            </div>
          )}

          {/* Filtreler */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Arama</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Ad, e-posta, pozisyon..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durum</label>
                <select
                  value={filter}
                  onChange={(e) => { setFilter(e.target.value as 'all' | 'active'); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Tümü</option>
                  <option value="active">Aktif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Departman</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Tümü</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Tümü</option>
                  {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{filteredUsers.length}</span> sonuç bulundu
                </span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Filtreleri temizle
                </button>
              </div>
            )}
          </div>

          {/* Tablo */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-red-800">{error}</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">
                {hasActiveFilters ? 'Arama kriterlerine uygun kullanıcı bulunamadı.' : 'Henüz kullanıcı eklenmemiş.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-2 text-sm text-indigo-600 hover:underline">
                  Filtreleri temizle
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Scroll wrapper — yatay kaydırma buradan */}
              <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:bg-gray-100"
                        onClick={() => handleSort('firstName')}
                      >
                        Ad Soyad <SortIcon field="firstName" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:bg-gray-100"
                        onClick={() => handleSort('email')}
                      >
                        E-posta <SortIcon field="email" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:bg-gray-100"
                        onClick={() => handleSort('department')}
                      >
                        Departman <SortIcon field="department" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:bg-gray-100"
                        onClick={() => handleSort('position')}
                      >
                        Pozisyon <SortIcon field="position" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:bg-gray-100"
                        onClick={() => handleSort('roles')}
                      >
                        Roller <SortIcon field="roles" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <button
                            type="button"
                            onClick={() => handleViewUser(user.id!)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            {user.firstName} {user.lastName}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.department || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.position || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 min-w-[120px]">
                            {(user.roles ?? []).map((role, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleViewUser(user.id!)}
                            className="text-gray-700 hover:text-gray-900 font-medium"
                          >
                            Detay
                          </button>
                          <button
                            onClick={() => handleEditUser(user.id!)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id!)}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{filteredUsers.length}</span> kullanıcıdan{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>–
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> gösteriliyor
                  </p>
                  <nav className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Önceki
                    </button>
                    {pageNumbers().map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 rounded border text-sm font-medium ${
                            currentPage === p
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Sonraki →
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
