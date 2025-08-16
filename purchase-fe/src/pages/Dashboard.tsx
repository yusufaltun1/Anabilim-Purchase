import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { workflowService } from '../services/workflow.service';
import { ApprovalWorkflow } from '../types/workflow';
import { authService } from '../services/auth.service';

export const Dashboard = () => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getAllWorkflows();
      setWorkflows(data);
    } catch (err) {
      setError('Workflow\'lar yüklenirken hata oluştu');
      console.error('Error loading workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = () => {
    navigate('/workflows/create');
  };

  const handleEditWorkflow = (id: number) => {
    navigate(`/workflows/edit/${id}`);
  };

  const handleDeleteWorkflow = async (id: number) => {
    if (window.confirm('Bu workflow\'u silmek istediğinizden emin misiniz?')) {
      try {
        await workflowService.deleteWorkflow(id);
        setWorkflows(workflows.filter(w => w.id !== id));
      } catch (err) {
        setError('Workflow silinirken hata oluştu');
        console.error('Error deleting workflow:', err);
      }
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Hoş geldiniz, {userInfo?.displayName || userInfo?.firstName || 'Kullanıcı'}!
              </p>
            </div>
            <button
              onClick={handleCreateWorkflow}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Yeni Workflow</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-indigo-500 rounded-md p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Workflow</dt>
                    <dd className="text-lg font-medium text-gray-900">{workflows.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-500 rounded-md p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Aktif Workflow</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {workflows.filter(w => w.isActive).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-500 rounded-md p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Kategoriler</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {new Set(workflows.map(w => w.category)).size}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflows List */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Son Workflow'lar</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Sistemdeki tüm onay süreçleri
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="px-4 py-5 sm:px-6">
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
            ) : workflows.length === 0 ? (
              <div className="px-4 py-5 sm:px-6">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Workflow bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">Henüz hiç workflow oluşturulmamış.</p>
                  <div className="mt-6">
                    <button
                      onClick={handleCreateWorkflow}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      İlk Workflow'u Oluştur
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {workflows.slice(0, 5).map((workflow) => (
                  <li key={workflow.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            workflow.isActive ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <svg className={`w-4 h-4 ${workflow.isActive ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">{workflow.name}</p>
                            {workflow.isActive && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{workflow.description}</p>
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            <span>Kategori: {workflow.category}</span>
                            <span>Tutar: {formatAmount(workflow.minAmount)} - {formatAmount(workflow.maxAmount)}</span>
                            <span>Adım: {workflow.steps.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditWorkflow(workflow.id!)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow.id!)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {workflows.length > 5 && (
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  onClick={() => navigate('/workflows')}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Tümünü Görüntüle →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 