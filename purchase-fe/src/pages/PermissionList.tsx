import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { permissionService } from '../services/permission.service';
import { Permission } from '../types/permission';

export const PermissionList = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Permission>({
    name: '',
    displayName: '',
    description: '',
    resource: '',
    action: '',
    isActive: true
  });

  const load = async () => {
    try {
      setLoading(true);
      setPermissions(await permissionService.getAllPermissions());
    } catch (e) {
      setError('Permissionlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await permissionService.createPermission(formData);
      setFormData({ name: '', displayName: '', description: '', resource: '', action: '', isActive: true });
      await load();
    } catch {
      setError('Permission oluşturulamadı');
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Permission silinsin mi?')) return;
    try {
      await permissionService.deletePermission(id);
      await load();
    } catch {
      setError('Permission silinemedi');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Permissionlar</h1>
          <p className="mt-2 text-gray-600">Permission tanımlarını ekrandan yönetin</p>
        </div>

        {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 p-3 rounded">{error}</div>}

        <form onSubmit={handleCreate} className="bg-white shadow rounded-lg p-4 grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
          <input className="border rounded px-3 py-2" placeholder="NAME" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))} required />
          <input className="border rounded px-3 py-2" placeholder="Görünen Ad" value={formData.displayName} onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))} required />
          <input className="border rounded px-3 py-2" placeholder="Resource" value={formData.resource} onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value.toUpperCase() }))} required />
          <input className="border rounded px-3 py-2" placeholder="Action" value={formData.action} onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value.toUpperCase() }))} required />
          <input className="border rounded px-3 py-2" placeholder="Açıklama" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} required />
          <button className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700">Ekle</button>
        </form>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6">Yükleniyor...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Görünen Ad</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Resource</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Action</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Açıklama</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {permissions.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-sm font-mono">{p.name}</td>
                    <td className="px-3 py-2 text-sm">{p.displayName}</td>
                    <td className="px-3 py-2 text-sm">{p.resource}</td>
                    <td className="px-3 py-2 text-sm">{p.action}</td>
                    <td className="px-3 py-2 text-sm">{p.description}</td>
                    <td className="px-3 py-2 text-sm text-right">
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

