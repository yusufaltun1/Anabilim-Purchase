import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { workflowService } from '../services/workflow.service';
import { WorkflowStep, UpdateWorkflowRequest, ApprovalWorkflow } from '../types/workflow';

export const WorkflowEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    category: '',
  });
  
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [originalData, setOriginalData] = useState<ApprovalWorkflow | null>(null);

  // Predefined categories and roles for better UX
  const categories = [
    'IT_EQUIPMENT',
    'OFFICE_SUPPLIES', 
    'MARKETING_MATERIALS',
    'TRAINING_SERVICES',
    'CONSULTING_SERVICES',
    'OTHER'
  ];

  const roles = [
    'MANAGER',
    'PURCHASE_MANAGER', 
    'SYSTEM_ADMIN',
    'FINANCE_MANAGER',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER'
  ];

  const approvalTypes = [
    { value: 'APPROVE', label: 'Onayla' },
    { value: 'REJECT', label: 'Reddet' },
    { value: 'COMMENT', label: 'Yorum Yap' }
  ];

  useEffect(() => {
    if (id) {
      loadWorkflow(parseInt(id));
    }
  }, [id]);

  const loadWorkflow = async (workflowId: number) => {
    try {
      setLoading(true);
      const workflow = await workflowService.getWorkflowById(workflowId);
      
      setOriginalData(workflow);
      setFormData({
        name: workflow.name,
        description: workflow.description,
        minAmount: workflow.minAmount.toString(),
        maxAmount: workflow.maxAmount.toString(),
        category: workflow.category,
      });
      
      setSteps(workflow.steps.map(step => ({ ...step })));
    } catch (err) {
      setError('Workflow yüklenirken hata oluştu');
      console.error('Error loading workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStepChange = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    
    // Update step order if needed
    if (field === 'stepOrder') {
      newSteps[index].stepOrder = parseInt(value);
    }
    
    setSteps(newSteps);
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      stepOrder: steps.length + 1,
      roleName: '',
      approvalType: 'APPROVE',
      isRequired: true,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      // Reorder steps
      newSteps.forEach((step, i) => {
        step.stepOrder = i + 1;
      });
      setSteps(newSteps);
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < steps.length - 1)
    ) {
      const newSteps = [...steps];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap steps
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      
      // Update step orders
      newSteps.forEach((step, i) => {
        step.stepOrder = i + 1;
      });
      
      setSteps(newSteps);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Workflow adı gereklidir');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Açıklama gereklidir');
      return false;
    }
    
    if (!formData.category) {
      setError('Kategori seçimi gereklidir');
      return false;
    }
    
    const minAmount = parseFloat(formData.minAmount);
    const maxAmount = parseFloat(formData.maxAmount);
    
    if (isNaN(minAmount) || minAmount < 0) {
      setError('Geçerli minimum tutar giriniz');
      return false;
    }
    
    if (isNaN(maxAmount) || maxAmount <= minAmount) {
      setError('Maksimum tutar minimum tutardan büyük olmalıdır');
      return false;
    }
    
    // Validate steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.roleName.trim()) {
        setError(`${i + 1}. adım için rol seçimi gereklidir`);
        return false;
      }
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
      const workflowData: UpdateWorkflowRequest = {
        id: parseInt(id),
        name: formData.name.trim(),
        description: formData.description.trim(),
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
        category: formData.category,
        steps: steps.map(step => ({
          ...step,
          roleName: step.roleName.trim()
        }))
      };
      
      await workflowService.updateWorkflow(parseInt(id), workflowData);
      navigate('/workflows', { 
        state: { message: 'Workflow başarıyla güncellendi!' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Workflow güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      const hasChanges = 
        formData.name !== originalData.name ||
        formData.description !== originalData.description ||
        formData.minAmount !== originalData.minAmount.toString() ||
        formData.maxAmount !== originalData.maxAmount.toString() ||
        formData.category !== originalData.category ||
        JSON.stringify(steps) !== JSON.stringify(originalData.steps);
      
      if (hasChanges) {
        if (window.confirm('Değişiklikleriniz kaydedilmeyecek. Devam etmek istiyor musunuz?')) {
          navigate('/workflows');
        }
      } else {
        navigate('/workflows');
      }
    } else {
      navigate('/workflows');
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
                    onClick={() => navigate('/workflows')}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    ← Workflow listesine dön
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
              <h1 className="text-3xl font-bold text-gray-900">Workflow Düzenle</h1>
              <p className="mt-2 text-gray-600">
                "{originalData?.name}" workflow'unu düzenleyin
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
                  Workflow Adı *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Örn: IT Ekipman Satınalma"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ')}
                    </option>
                  ))}
                </select>
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
                  placeholder="Bu workflow'un amacını ve kapsamını açıklayın"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Tutar (₺) *
                </label>
                <input
                  type="number"
                  id="minAmount"
                  value={formData.minAmount}
                  onChange={(e) => handleInputChange('minAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Tutar (₺) *
                </label>
                <input
                  type="number"
                  id="maxAmount"
                  value={formData.maxAmount}
                  onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="10000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Onay Adımları</h3>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adım Ekle
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Adım {step.stepOrder}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {steps.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === steps.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </>
                      )}
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol *
                      </label>
                      <select
                        value={step.roleName}
                        onChange={(e) => handleStepChange(index, 'roleName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Rol seçin</option>
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {role.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Onay Tipi
                      </label>
                      <select
                        value={step.approvalType}
                        onChange={(e) => handleStepChange(index, 'approvalType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {approvalTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={step.isRequired}
                          onChange={(e) => handleStepChange(index, 'isRequired', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Zorunlu</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {steps.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz adım eklenmedi</h3>
                <p className="mt-1 text-sm text-gray-500">Onay süreciniz için adımlar ekleyin.</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}; 