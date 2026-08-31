import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { userService } from '../services/user.service';
import { assignmentService } from '../services/assignment.service';
import { User } from '../types/user';
import { Assignment, AssignmentStatus } from '../types/assignment';
import { AssignmentManageSection } from '../components/product/AssignmentManageSection';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../utils/date';

const normalizePlaceholder = (value?: string | null) => {
  if (!value) return '—';
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'unknown') return '—';
  return trimmed;
};

const managerLabel = (manager: User['manager']) => {
  if (!manager) return '—';
  const named = manager as User['manager'] & {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  if (named.firstName || named.lastName) {
    return `${named.firstName ?? ''} ${named.lastName ?? ''}`.trim();
  }
  if (named.email) return named.email;
  if (manager.id) return `Kullanıcı #${manager.id}`;
  return '—';
};

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  const userId = parseInt(id || '', 10);

  const loadAssignments = useCallback(async (targetUserId: number) => {
    try {
      setAssignmentsLoading(true);
      const list = await assignmentService.getAssignmentsByUserId(targetUserId);
      setAssignments(list.filter((a) => a.status === AssignmentStatus.ACTIVE));
      setAssignmentHistory(list.filter((a) => a.status !== AssignmentStatus.ACTIVE));
    } catch (err) {
      console.error('Error loading user assignments:', err);
      setAssignments([]);
      setAssignmentHistory([]);
    } finally {
      setAssignmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message as string);
      navigate(location.pathname, { replace: true });
      const timer = window.setTimeout(() => setSuccessMessage(null), 5000);
      return () => window.clearTimeout(timer);
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (Number.isNaN(userId) || userId <= 0) {
      navigate('/users');
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserById(userId);
        if (!response.success || !response.data || Array.isArray(response.data)) {
          throw new Error('Kullanıcı bulunamadı');
        }
        setUser(response.data);
        await loadAssignments(userId);
      } catch (err) {
        console.error('Error loading user:', err);
        showNotification('Kullanıcı bilgileri yüklenirken hata oluştu', 'error');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [userId, navigate, showNotification, loadAssignments]);

  const handleDelete = async () => {
    if (!user?.id) return;
    if (!window.confirm(`"${user.firstName} ${user.lastName}" kullanıcısını silmek istiyor musunuz?`)) {
      return;
    }
    try {
      await userService.deleteUser(user.id);
      showNotification('Kullanıcı silindi', 'success');
      navigate('/users', { state: { message: 'Kullanıcı başarıyla silindi!' } });
    } catch {
      showNotification('Kullanıcı silinirken hata oluştu', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                <Link to="/users" className="hover:text-indigo-600">
                  Kullanıcılar
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-700">{fullName}</span>
              </p>
              <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
              <p className="mt-1 text-sm text-gray-600">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'Aktif' : 'Pasif'}
                </span>
                {user.roles?.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={() => navigate(`/users/edit/${user.id}`)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Düzenle
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 text-sm font-medium text-green-800">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">İletişim</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">E-posta</dt>
                  <dd className="text-gray-900 text-right">{user.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Telefon</dt>
                  <dd className="text-gray-900 text-right">{normalizePlaceholder(user.phone)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Yönetici</dt>
                  <dd className="text-gray-900 text-right">{managerLabel(user.manager)}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Organizasyon</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Departman</dt>
                  <dd className="text-gray-900 text-right">{normalizePlaceholder(user.department)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Pozisyon</dt>
                  <dd className="text-gray-900 text-right">{normalizePlaceholder(user.position)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Okul / Şirket</dt>
                  <dd className="text-gray-900 text-right">{user.schoolName || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Çalışma konumu</dt>
                  <dd className="text-gray-900 text-right">
                    {user.workLocationName || normalizePlaceholder(user.workLocation)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Birim (grup)</dt>
                  <dd className="text-gray-900 text-right">
                    {user.userGroupNames && user.userGroupNames.length > 0
                      ? user.userGroupNames.join(', ')
                      : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {(user.createdAt || user.updatedAt) && (
            <div className="bg-white shadow rounded-lg px-6 py-4 mb-8 text-xs text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
              {user.createdAt && <span>Oluşturulma: {formatDate(user.createdAt)}</span>}
              {user.updatedAt && <span>Son güncelleme: {formatDate(user.updatedAt)}</span>}
            </div>
          )}

          <AssignmentManageSection
            title="Aktif Zimmetler"
            assignments={assignments}
            loading={assignmentsLoading}
            showProductColumn
            enableBulkActions
            printTitle={`${fullName} — Aktif Zimmetler`}
            onRefresh={() => loadAssignments(userId)}
          />

          <AssignmentManageSection
            title="Zimmet Geçmişi"
            assignments={assignmentHistory}
            loading={assignmentsLoading}
            showProductColumn
            readOnly
            printTitle={`${fullName} — Zimmet Geçmişi`}
            onRefresh={() => loadAssignments(userId)}
          />
        </div>
      </div>
    </div>
  );
};
