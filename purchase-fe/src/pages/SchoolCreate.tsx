import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { schoolService } from '../services/school.service';
import { CreateSchoolRequest, SchoolType } from '../types/school';
import { useNotification } from '../contexts/NotificationContext';

export const SchoolCreate = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSchoolRequest>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
    district: '',
    city: '',
    schoolType: SchoolType.ILKOKUL,
    studentCapacity: 100,
    isActive: true
  });

  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-ZÇĞIİÖŞÜ0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 20);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      code: generateCode(name)
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'studentCapacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      showNotification('error', 'Okul adı zorunludur');
      return;
    }

    if (!formData.code.trim()) {
      showNotification('error', 'Okul kodu zorunludur');
      return;
    }

    if (!formData.address.trim()) {
      showNotification('error', 'Adres zorunludur');
      return;
    }

    if (!formData.phone.trim()) {
      showNotification('error', 'Telefon zorunludur');
      return;
    }

    if (!formData.email.trim()) {
      showNotification('error', 'E-posta zorunludur');
      return;
    }

    if (!formData.principalName.trim()) {
      showNotification('error', 'Müdür adı zorunludur');
      return;
    }

    if (!formData.city.trim()) {
      showNotification('error', 'Şehir zorunludur');
      return;
    }

    if (!formData.district.trim()) {
      showNotification('error', 'İlçe zorunludur');
      return;
    }

    if (formData.studentCapacity <= 0) {
      showNotification('error', 'Öğrenci kapasitesi 0\'dan büyük olmalıdır');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('error', 'Geçerli bir e-posta adresi giriniz');
      return;
    }

    // Phone validation
    const phoneRegex = /^[+]?[0-9\s-()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      showNotification('error', 'Geçerli bir telefon numarası giriniz');
      return;
    }

    try {
      setLoading(true);
      await schoolService.createSchool(formData);
      showNotification('success', 'Okul başarıyla oluşturuldu');
      navigate('/schools');
    } catch (err: any) {
      console.error('Error creating school:', err);
      console.error('Error response data:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Okul oluşturulurken bir hata oluştu';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Yeni Okul</h1>
            <button
              onClick={() => navigate('/schools')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Geri
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 ${loading ? 'opacity-50' : ''}`}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* School Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Okul Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Atatürk İlkokulu"
                />
              </div>

              {/* School Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Okul Kodu *
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md uppercase"
                  placeholder="ATK_ILK_001"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Okul adından otomatik oluşturulur, düzenleyebilirsiniz
                </p>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adres *
                </label>
                <textarea
                  name="address"
                  id="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Merkez"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="+90 212 555 0101"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="info@ataturkilkokulu.edu.tr"
                />
              </div>

              {/* Principal Name */}
              <div>
                <label htmlFor="principalName" className="block text-sm font-medium text-gray-700">
                  Müdür Adı *
                </label>
                <input
                  type="text"
                  name="principalName"
                  id="principalName"
                  required
                  value={formData.principalName}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Mehmet Yılmaz"
                />
              </div>

              {/* School Type */}
              <div>
                <label htmlFor="schoolType" className="block text-sm font-medium text-gray-700">
                  Okul Türü *
                </label>
                <select
                  name="schoolType"
                  id="schoolType"
                  required
                  value={formData.schoolType}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
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

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Şehir *
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="İstanbul"
                />
              </div>

              {/* District */}
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                  İlçe *
                </label>
                <input
                  type="text"
                  name="district"
                  id="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Merkez"
                />
              </div>

              {/* Student Capacity */}
              <div>
                <label htmlFor="studentCapacity" className="block text-sm font-medium text-gray-700">
                  Öğrenci Kapasitesi *
                </label>
                <input
                  type="number"
                  name="studentCapacity"
                  id="studentCapacity"
                  required
                  min="1"
                  value={formData.studentCapacity}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/schools')}
                disabled={loading}
                className={`py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Kaydediliyor...
                  </div>
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 