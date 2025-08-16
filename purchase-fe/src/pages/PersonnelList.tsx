import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { schoolPersonnelService } from '../services/school-personnel.service';
import { schoolService } from '../services/school.service';
import { SchoolPersonnel, PersonnelSearchParams, PaginatedPersonnelResponse, PersonnelRole, PersonnelStatus, EmploymentType } from '../types/school-personnel';
import { School } from '../types/school';
import { useNotification } from '../contexts/NotificationContext';

export const PersonnelList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [personnel, setPersonnel] = useState<SchoolPersonnel[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('');

  useEffect(() => {
    loadPersonnel();
  }, [pagination.number, pagination.size]);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      const params: PersonnelSearchParams = {
        page: pagination.number,
        size: pagination.size,
        sort: 'firstName,asc'
      };

      let response: PaginatedPersonnelResponse;

      if (searchQuery.trim()) {
        response = await schoolPersonnelService.searchPersonnel({
          ...params,
          query: searchQuery.trim()
        });
      } else if (selectedSchool) {
        response = await schoolPersonnelService.getPersonnelBySchool(Number(selectedSchool), params);
      } else {
        response = await schoolPersonnelService.getAllPersonnel(params);
      }

      setPersonnel(response.content);
      setPagination({
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        size: response.size,
        number: response.number
      });
    } catch (err: any) {
      console.error('Error loading personnel:', err);
      showNotification('Personel listesi yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      const activeSchools = await schoolService.getActiveSchools();
      setSchools(activeSchools);
    } catch (err) {
      console.error('Error loading schools:', err);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, number: 0 }));
    loadPersonnel();
  };

  const handleFilterBySchool = (schoolId: string) => {
    setSelectedSchool(schoolId === '' ? '' : Number(schoolId));
    setPagination(prev => ({ ...prev, number: 0 }));
    loadPersonnel();
  };

  const handleFilterByRole = async (role: string) => {
    if (!role) {
      setSelectedRole('');
      loadPersonnel();
      return;
    }

    try {
      setLoading(true);
      setSelectedRole(role);
      const filteredPersonnel = await schoolPersonnelService.getPersonnelByRole(role);
      setPersonnel(filteredPersonnel);
      setPagination(prev => ({
        ...prev,
        totalElements: filteredPersonnel.length,
        totalPages: 1,
        number: 0
      }));
    } catch (err: any) {
      showNotification('Role göre filtreleme başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByStatus = async (status: string) => {
    if (!status) {
      setSelectedStatus('');
      loadPersonnel();
      return;
    }

    try {
      setLoading(true);
      setSelectedStatus(status);
      const filteredPersonnel = await schoolPersonnelService.getPersonnelByStatus(status);
      setPersonnel(filteredPersonnel);
      setPagination(prev => ({
        ...prev,
        totalElements: filteredPersonnel.length,
        totalPages: 1,
        number: 0
      }));
    } catch (err: any) {
      showNotification('Duruma göre filtreleme başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByEmploymentType = async (employmentType: string) => {
    if (!employmentType) {
      setSelectedEmploymentType('');
      loadPersonnel();
      return;
    }

    try {
      setLoading(true);
      setSelectedEmploymentType(employmentType);
      const filteredPersonnel = await schoolPersonnelService.getPersonnelByEmploymentType(employmentType);
      setPersonnel(filteredPersonnel);
      setPagination(prev => ({
        ...prev,
        totalElements: filteredPersonnel.length,
        totalPages: 1,
        number: 0
      }));
    } catch (err: any) {
      showNotification('İstihdam türüne göre filtreleme başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, fullName: string) => {
    if (!window.confirm(`"${fullName}" personelini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await schoolPersonnelService.deletePersonnel(id);
      showNotification('Personel başarıyla silindi', 'success');
      loadPersonnel();
    } catch (err: any) {
      showNotification('Personel silinirken bir hata oluştu', 'error');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSchool('');
    setSelectedRole('');
    setSelectedStatus('');
    setSelectedEmploymentType('');
    setPagination(prev => ({ ...prev, number: 0 }));
    loadPersonnel();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, number: newPage }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case PersonnelStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case PersonnelStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case PersonnelStatus.ON_LEAVE:
        return 'bg-yellow-100 text-yellow-800';
      case PersonnelStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      case PersonnelStatus.RETIRED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Okul Personeli</h1>
            <button
              onClick={() => navigate('/personnel/create')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Yeni Personel
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Personel ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-l-md"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-r-md"
                  >
                    Ara
                  </button>
                </div>
              </div>

              {/* School Filter */}
              <div>
                <select
                  value={selectedSchool}
                  onChange={(e) => handleFilterBySchool(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Tüm Okullar</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={selectedRole}
                  onChange={(e) => handleFilterByRole(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Tüm Roller</option>
                  {Object.values(PersonnelRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleFilterByStatus(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Tüm Durumlar</option>
                  {Object.values(PersonnelStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Employment Type Filter */}
              <div>
                <select
                  value={selectedEmploymentType}
                  onChange={(e) => handleFilterByEmploymentType(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Tüm İstihdam Türleri</option>
                  {Object.values(EmploymentType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedSchool || selectedRole || selectedStatus || selectedEmploymentType) && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="mb-4 text-sm text-gray-600">
            Toplam {pagination.totalElements} personel bulundu
          </div>

          {/* Personnel List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : personnel.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              Hiç personel bulunamadı.
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {personnel.map((person) => (
                  <li key={person.id}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {person.firstName} {person.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {person.role} • {person.employmentType}
                              </p>
                            </div>
                            <div className="ml-4">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(person.status)}`}>
                                {person.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => navigate(`/personnel/${person.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Detay
                            </button>
                            <button
                              onClick={() => navigate(`/personnel/edit/${person.id}`)}
                              className="text-yellow-600 hover:text-yellow-900 font-medium"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(person.id, `${person.firstName} ${person.lastName}`)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              🏫 {person.schoolName || 'Okul bilgisi yok'}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              📧 {person.email}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              📞 {person.phone}
                            </p>
                          </div>
                        </div>
                        {person.branchSubject && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              📚 Branş: {person.branchSubject}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.number - 1)}
                  disabled={pagination.number === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <button
                  onClick={() => handlePageChange(pagination.number + 1)}
                  disabled={pagination.number >= pagination.totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{pagination.number * pagination.size + 1}</span>
                    {' - '}
                    <span className="font-medium">
                      {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)}
                    </span>
                    {' / '}
                    <span className="font-medium">{pagination.totalElements}</span>
                    {' sonuç gösteriliyor'}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.number - 1)}
                      disabled={pagination.number === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = pagination.number < 3 ? i : pagination.number - 2 + i;
                      if (pageNum >= pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.number
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.number + 1)}
                      disabled={pagination.number >= pagination.totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 