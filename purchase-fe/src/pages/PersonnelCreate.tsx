import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { schoolPersonnelService } from '../services/school-personnel.service';
import { schoolService } from '../services/school.service';
import { CreatePersonnelRequest, PersonnelRole, PersonnelStatus, EmploymentType } from '../types/school-personnel';
import { School } from '../types/school';
import { useNotification } from '../contexts/NotificationContext';

export const PersonnelCreate = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState<CreatePersonnelRequest>({
    schoolId: 0,
    firstName: '',
    lastName: '',
    tcNo: '',
    email: '',
    phone: '',
    address: '',
    role: PersonnelRole.TEACHER,
    employmentType: EmploymentType.PERMANENT,
    status: PersonnelStatus.ACTIVE,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    salary: 0,
    department: '',
    branchSubject: '',
    qualifications: '',
    notes: ''
  });

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const activeSchools = await schoolService.getActiveSchools();
      setSchools(activeSchools);
      if (activeSchools.length > 0) {
        setFormData(prev => ({ ...prev, schoolId: activeSchools[0].id }));
      }
    } catch (err) {
      console.error('Error loading schools:', err);
      showNotification('Okullar yüklenirken bir hata oluştu', 'error');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'schoolId' || name === 'salary' ? 
        (value === '' ? 0 : parseInt(value)) : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.schoolId) {
      showNotification('Okul seçimi zorunludur', 'error');
      return false;
    }

    if (!formData.firstName.trim()) {
      showNotification('Ad zorunludur', 'error');
      return false;
    }

    if (!formData.lastName.trim()) {
      showNotification('Soyad zorunludur', 'error');
      return false;
    }

    if (!formData.tcNo.trim()) {
      showNotification('TC Kimlik No zorunludur', 'error');
      return false;
    }

    // TC No validation (11 digits)
    if (!/^\d{11}$/.test(formData.tcNo)) {
      showNotification('TC Kimlik No 11 haneli olmalıdır', 'error');
      return false;
    }

    if (!formData.email.trim()) {
      showNotification('E-posta zorunludur', 'error');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Geçerli bir e-posta adresi giriniz', 'error');
      return false;
    }

    if (!formData.phone.trim()) {
      showNotification('Telefon zorunludur', 'error');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[+]?[0-9\s-()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      showNotification('Geçerli bir telefon numarası giriniz', 'error');
      return false;
    }

    if (!formData.address.trim()) {
      showNotification('Adres zorunludur', 'error');
      return false;
    }

    if (!formData.startDate) {
      showNotification('İşe başlama tarihi zorunludur', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Clean up form data
      const submitData: CreatePersonnelRequest = {
        ...formData,
        endDate: formData.endDate || undefined,
        salary: formData.salary || undefined,
        department: formData.department || undefined,
        branchSubject: formData.branchSubject || undefined,
        qualifications: formData.qualifications || undefined,
        notes: formData.notes || undefined
      };

      await schoolPersonnelService.createPersonnel(submitData);
      showNotification('Personel başarıyla oluşturuldu', 'success');
      navigate('/personnel');
    } catch (err: any) {
      console.error('Error creating personnel:', err);
      showNotification(err.response?.data?.message || 'Personel oluşturulurken bir hata oluştu', 'error');
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
            <h1 className="text-3xl font-bold text-gray-900">Yeni Personel</h1>
            <button
              onClick={() => navigate('/personnel')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Geri
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 ${loading ? 'opacity-50' : ''}`}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* School Selection */}
              <div className="sm:col-span-2">
                <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700">
                  Okul *
                </label>
                <select
                  name="schoolId"
                  id="schoolId"
                  required
                  value={formData.schoolId}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value={0}>Okul Seçiniz</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Ad *
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Mehmet"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Soyad *
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Yılmaz"
                />
              </div>

              {/* TC No */}
              <div>
                <label htmlFor="tcNo" className="block text-sm font-medium text-gray-700">
                  TC Kimlik No *
                </label>
                <input
                  type="text"
                  name="tcNo"
                  id="tcNo"
                  required
                  maxLength={11}
                  value={formData.tcNo}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="12345678901"
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
                  placeholder="mehmet.yilmaz@okul.edu.tr"
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
                  placeholder="+90 555 123 45 67"
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Görev *
                </label>
                <select
                  name="role"
                  id="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.values(PersonnelRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
                  İstihdam Türü *
                </label>
                <select
                  name="employmentType"
                  id="employmentType"
                  required
                  value={formData.employmentType}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.values(EmploymentType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Durum *
                </label>
                <select
                  name="status"
                  id="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.values(PersonnelStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  İşe Başlama Tarihi *
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  İşten Ayrılma Tarihi
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              {/* Salary */}
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                  Maaş (TL)
                </label>
                <input
                  type="number"
                  name="salary"
                  id="salary"
                  min="0"
                  step="0.01"
                  value={formData.salary || ''}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="15000.00"
                />
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Departman
                </label>
                <input
                  type="text"
                  name="department"
                  id="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Matematik Bölümü"
                />
              </div>

              {/* Branch Subject */}
              <div>
                <label htmlFor="branchSubject" className="block text-sm font-medium text-gray-700">
                  Branş (Öğretmenler için)
                </label>
                <input
                  type="text"
                  name="branchSubject"
                  id="branchSubject"
                  value={formData.branchSubject}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Matematik, Türkçe, İngilizce..."
                />
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
                  placeholder="Ev adresi..."
                />
              </div>

              {/* Qualifications */}
              <div className="sm:col-span-2">
                <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
                  Nitelikler / Eğitim Durumu
                </label>
                <textarea
                  name="qualifications"
                  id="qualifications"
                  rows={3}
                  value={formData.qualifications}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Eğitim durumu, sertifikalar, özel yetenekler..."
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notlar
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ek bilgiler, notlar..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/personnel')}
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