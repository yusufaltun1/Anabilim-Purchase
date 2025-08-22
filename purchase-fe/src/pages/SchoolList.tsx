import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { schoolService } from '../services/school.service';
import { School, SchoolSearchParams, PaginatedSchoolResponse, SchoolType } from '../types/school';
import { useNotification } from '../contexts/NotificationContext';

export const SchoolList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSchoolType, setSelectedSchoolType] = useState('');

  // Get unique cities and districts from schools
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    loadSchools();
  }, [pagination.number, pagination.size]);

  useEffect(() => {
    loadCitiesAndDistricts();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const params: SchoolSearchParams = {
        page: pagination.number,
        size: pagination.size,
        sort: 'name,asc'
      };

      let response: PaginatedSchoolResponse;

      if (searchQuery.trim()) {
        response = await schoolService.searchSchools({
          ...params,
          query: searchQuery.trim()
        });
      } else {
        response = await schoolService.getAllSchools(params);
      }

      setSchools(response.content);
      setPagination({
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        size: response.size,
        number: response.number
      });
    } catch (err: any) {
      console.error('Error loading schools:', err);
      showNotification('error', 'Okullar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadCitiesAndDistricts = async () => {
    try {
      const activeSchools = await schoolService.getActiveSchools();
      const uniqueCities = [...new Set(activeSchools.map(school => school.city))].sort();
      const uniqueDistricts = [...new Set(activeSchools.map(school => school.district))].sort();
      
      setCities(uniqueCities);
      setDistricts(uniqueDistricts);
    } catch (err) {
      console.error('Error loading cities and districts:', err);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, number: 0 }));
    loadSchools();
  };

  const handleFilterByCity = async (city: string) => {
    if (!city) {
      setSelectedCity('');
      loadSchools();
      return;
    }

    try {
      setLoading(true);
      setSelectedCity(city);
      const filteredSchools = await schoolService.getSchoolsByCity(city);
      setSchools(filteredSchools);
      setPagination(prev => ({
        ...prev,
        totalElements: filteredSchools.length,
        totalPages: 1,
        number: 0
      }));
    } catch (err: any) {
      showNotification('error', 'Şehire göre filtreleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByDistrict = async (district: string) => {
    if (!district) {
      setSelectedDistrict('');
      loadSchools();
      return;
    }

    try {
      setLoading(true);
      setSelectedDistrict(district);
      const filteredSchools = await schoolService.getSchoolsByDistrict(district);
      setSchools(filteredSchools);
      setPagination(prev => ({
        ...prev,
        totalElements: filteredSchools.length,
        totalPages: 1,
        number: 0
      }));
    } catch (err: any) {
      showNotification('error', 'İlçeye göre filtreleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByType = async (schoolType: string) => {
    if (!schoolType) {
      setSelectedSchoolType('');
      loadSchools();
      return;
    }

    try {
      setLoading(true);
      setSelectedSchoolType(schoolType);
      const filteredSchools = await schoolService.getSchoolsByType(schoolType);
      setSchools(filteredSchools);
      setPagination(prev => ({
        ...prev,
        totalElements: filteredSchools.length,
        totalPages: 1,
        number: 0
      }));
    } catch (err: any) {
      showNotification('error', 'Türe göre filtreleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" okulunu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await schoolService.deleteSchool(id);
      showNotification('success', 'Okul başarıyla silindi');
      loadSchools();
    } catch (err: any) {
      showNotification('error', 'Okul silinirken bir hata oluştu');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedSchoolType('');
    setPagination(prev => ({ ...prev, number: 0 }));
    loadSchools();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, number: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Okullar</h1>
            <button
              onClick={() => navigate('/schools/create')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Yeni Okul
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Okul ara..."
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

              {/* City Filter */}
              <div>
                <select
                  value={selectedCity}
                  onChange={(e) => handleFilterByCity(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Tüm Şehirler</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* District Filter */}
              <div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleFilterByDistrict(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Tüm İlçeler</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              {/* School Type Filter */}
              <div>
                <select
                  value={selectedSchoolType}
                  onChange={(e) => handleFilterByType(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Tüm Türler</option>
                  {Object.entries(SchoolType).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key === 'ILKOKUL' ? 'İlkokul' :
                       key === 'ORTAOKUL' ? 'Ortaokul' :
                       key === 'LISE' ? 'Lise' :
                       key === 'ANAOKULU' ? 'Anaokulu' :
                       key === 'UNIVERSITE' ? 'Üniversite' :
                       key === 'MESLEK_LISESI' ? 'Meslek Lisesi' :
                       key === 'ANADOLU_LISESI' ? 'Anadolu Lisesi' :
                       key === 'FEN_LISESI' ? 'Fen Lisesi' : value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCity || selectedDistrict || selectedSchoolType) && (
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
            Toplam {pagination.totalElements} okul bulundu
          </div>

          {/* Schools List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : schools.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              Hiç okul bulunamadı.
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {schools.map((school) => (
                  <li key={school.id}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {school.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {school.code} • {school.schoolType}
                              </p>
                            </div>
                            <div className="ml-4">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                school.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {school.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => navigate(`/schools/${school.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Detay
                            </button>
                            <button
                              onClick={() => navigate(`/schools/edit/${school.id}`)}
                              className="text-yellow-600 hover:text-yellow-900 font-medium"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(school.id, school.name)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              📍 {school.city}, {school.district}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              👨‍💼 {school.principalName}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              👥 Kapasite: {school.studentCapacity}
                            </p>
                          </div>
                        </div>
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