import { useState, useEffect, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Combobox, Transition } from '@headlessui/react';
import { Navigation } from '../components/Navigation';
import { userService } from '../services/user.service';
import { roleService } from '../services/role.service';
import { User, UpdateUserRequest, UserResponse } from '../types/user';

export const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [managerQuery, setManagerQuery] = useState('');
  const [formData, setFormData] = useState<UpdateUserRequest>({
    id: parseInt(id!),
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    phone: '',
    roles: [],
    microsoft365Id: '',
    manager: null,
  });

  useEffect(() => {
    console.log('Current Form Data:', formData); // Debug için
  }, [formData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // API çağrılarını yap
        const userResponse = await userService.getUserById(parseInt(id!));
        const roles = await roleService.getActiveRoles();
        const usersResponse = await userService.getActiveUsers();

        if (!userResponse.success || !usersResponse.success) {
          throw new Error('API yanıtı başarısız');
        }

        // API yanıtından user verisini al
        const user = userResponse.data as User;
        const users = usersResponse.data as User[];

        // Debug için API yanıtını kontrol et
        console.log('API User Response:', user);

        // API'den gelen user verisini formData'ya doğru şekilde aktar
        setFormData({
          id: parseInt(id!),
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          department: user.department || '',
          position: user.position || '',
          phone: user.phone || '',
          roles: user.roles || [],
          microsoft365Id: user.microsoft365Id || '',
          manager: user.manager || null
        });

        setAvailableRoles(roles.map(role => role.name));
        // Mevcut kullanıcıyı yönetici listesinden çıkar
        setManagers(users.filter(u => u.id !== parseInt(id!)));

        // Debug için form verisini kontrol et
        console.log('Form Data Set:', formData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Kullanıcı bilgileri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const filteredManagers = managerQuery === ''
    ? managers
    : managers.filter((manager) => {
        const fullName = `${manager.firstName} ${manager.lastName}`.toLowerCase();
        return fullName.includes(managerQuery.toLowerCase()) ||
               manager.email.toLowerCase().includes(managerQuery.toLowerCase());
      });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoles = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      roles: selectedRoles
    }));
  };

  const handleManagerSelect = (manager: User) => {
    setFormData(prev => ({
      ...prev,
      manager: { id: manager.id! }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await userService.updateUser(formData.id, formData);
      navigate('/users', { 
        state: { message: 'Kullanıcı başarıyla güncellendi!' }
      });
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Kullanıcı güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.email) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Düzenle</h1>
              <p className="mt-2 text-gray-600">
                Kullanıcı bilgilerini güncelleyin
              </p>
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

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ornek@anabilim.com"
                />
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Ad
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Soyad
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+90555123456"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Departman
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="IT, Finans, İK vb."
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Pozisyon
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Yazılım Geliştirici, Muhasebe Uzmanı vb."
                />
              </div>

              <div>
                <label htmlFor="microsoft365Id" className="block text-sm font-medium text-gray-700">
                  Microsoft 365 ID
                </label>
                <input
                  type="text"
                  id="microsoft365Id"
                  name="microsoft365Id"
                  value={formData.microsoft365Id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Yönetici
                </label>
                <Combobox value={formData.manager?.id ? managers.find(m => m.id === formData.manager?.id) || null : null} onChange={handleManagerSelect}>
                  <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        displayValue={(manager: User | null) => manager ? `${manager.firstName} ${manager.lastName}` : ''}
                        onChange={(event) => setManagerQuery(event.target.value)}
                        placeholder="Yönetici ara..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                          <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setManagerQuery('')}
                    >
                      <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                        {filteredManagers.length === 0 && managerQuery !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Sonuç bulunamadı.
                          </div>
                        ) : (
                          filteredManagers.map((manager) => (
                            <Combobox.Option
                              key={manager.id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={manager}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {manager.firstName} {manager.lastName} ({manager.email})
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-indigo-600'
                                      }`}
                                    >
                                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>

              <div>
                <label htmlFor="roles" className="block text-sm font-medium text-gray-700">
                  Roller
                </label>
                <select
                  id="roles"
                  name="roles"
                  multiple
                  required
                  value={formData.roles}
                  onChange={handleRoleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Birden fazla rol seçmek için Ctrl (Windows) veya Command (Mac) tuşunu basılı tutun
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 