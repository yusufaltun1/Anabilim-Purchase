import { useEffect, useState } from 'react';
import { assignmentService } from '../../services/assignment.service';
import { schoolService } from '../../services/school.service';
import { User } from '../../types/user';
import { School } from '../../types/school';
import { useNotification } from '../../contexts/NotificationContext';
import { AssignmentFormPhotoPicker } from './AssignmentFormPhotoPicker';
import { LocationHierarchyPickers } from '../common/LocationHierarchyPickers';
import { AssignmentUserSelect } from './AssignmentUserSelect';

interface StockItemAssignmentFormProps {
  productId: number;
  stockItemId: number;
  serialLabel?: string;
  onSuccess: () => void;
}

export const StockItemAssignmentForm = ({
  productId,
  stockItemId,
  serialLabel,
  onSuccess,
}: StockItemAssignmentFormProps) => {
  const { showNotification } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);

  const [assignmentType, setAssignmentType] = useState<'user' | 'location'>('user');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignedSchoolId, setAssignedSchoolId] = useState('');
  const [locationRootId, setLocationRootId] = useState<number | null>(null);
  const [locationMiddleId, setLocationMiddleId] = useState<number | null>(null);
  const [locationLeafId, setLocationLeafId] = useState<number | null>(null);
  const [locationDetails, setLocationDetails] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formPhotoFile, setFormPhotoFile] = useState<File | null>(null);
  const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    schoolService.getAllSchools({ size: 500 }).then((schoolRes) => {
      setSchools(schoolRes.content ?? []);
    });
  }, []);

  const assignedLocationId = locationLeafId ?? locationMiddleId ?? locationRootId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (assignmentType === 'user' && !assignedUserId) {
      showNotification('Lütfen bir kullanıcı seçin', 'error');
      return;
    }
    if (assignmentType === 'location' && !assignedLocationId) {
      showNotification('Lütfen bir konum seçin', 'error');
      return;
    }
    if (!formPhotoFile) {
      showNotification('Zimmet için ürün fotoğrafı zorunludur', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const result = await assignmentService.createAssignment(
        {
          productId,
          stockItemId,
          expectedReturnDate: expectedReturnDate || undefined,
          notes: notes.trim() || undefined,
          ...(assignmentType === 'user'
            ? {
                assignedUserId: parseInt(assignedUserId, 10),
                assignedSchoolId: assignedSchoolId
                  ? parseInt(assignedSchoolId, 10)
                  : selectedUser?.schoolId ?? undefined,
              }
            : {
                assignedLocationId,
                locationDetails: locationDetails.trim() || undefined,
              }),
        },
        formPhotoFile
      );

      const created = result.data && !Array.isArray(result.data) ? result.data : null;
      if (created?.id) {
        try {
          await assignmentService.downloadAssignmentForm(created.id);
          showNotification('Zimmet oluşturuldu. Fotoğraf forma eklendi, form indirildi.', 'success');
        } catch (err: unknown) {
          showNotification(
            err instanceof Error ? err.message : 'Zimmet oluşturuldu ancak form indirilemedi.',
            'error'
          );
        }
      } else {
        showNotification('Zimmet başarıyla oluşturuldu', 'success');
      }

      onSuccess();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Zimmet oluşturulamadı', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-indigo-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-900">Zimmet et</h4>
        {serialLabel && <span className="text-xs text-gray-500 truncate">{serialLabel}</span>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Zimmet tipi</label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={assignmentType}
          onChange={(e) => setAssignmentType(e.target.value as 'user' | 'location')}
        >
          <option value="user">Kişi zimmeti</option>
          <option value="location">Konum zimmeti</option>
        </select>
      </div>

      {assignmentType === 'user' ? (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kullanıcı *</label>
            <AssignmentUserSelect
              value={assignedUserId}
              onChange={(userId, user) => {
                setAssignedUserId(userId);
                setSelectedUser(user);
                setAssignedSchoolId(user?.schoolId?.toString() ?? '');
              }}
              disabled={submitting}
            />
          </div>
          {selectedUser && (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Çalışma konumu: </span>
              {selectedUser.workLocationName ||
                (selectedUser.workLocationParentId ? 'Tanımlı' : 'Tanımlı değil')}
              {selectedUser.schoolName && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  Okul: {selectedUser.schoolName}
                </span>
              )}
              {selectedUser.userGroupNames && selectedUser.userGroupNames.length > 0 && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  Birim: {selectedUser.userGroupNames.join(', ')}
                </span>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Konum, kullanıcının kartındaki çalışma konumundan otomatik alınır.
              </p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Okul (opsiyonel)</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={assignedSchoolId}
              onChange={(e) => setAssignedSchoolId(e.target.value)}
            >
              <option value="">Seçin</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Konum *</label>
            <LocationHierarchyPickers
              rootId={locationRootId}
              middleId={locationMiddleId}
              leafId={locationLeafId}
              onRootChange={(id) => {
                setLocationRootId(id);
                setLocationMiddleId(null);
                setLocationLeafId(null);
              }}
              onMiddleChange={(id) => {
                setLocationMiddleId(id);
                setLocationLeafId(null);
              }}
              onLeafChange={setLocationLeafId}
              showLeaf
              autoSelectDefaults
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Konum detayı</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="Örn: 3. kat, oda 12"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Beklenen iade tarihi</label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={expectedReturnDate}
          onChange={(e) => setExpectedReturnDate(e.target.value)}
        />
      </div>

      <AssignmentFormPhotoPicker
        file={formPhotoFile}
        preview={formPhotoPreview}
        onChange={(nextFile, nextPreview) => {
          setFormPhotoFile(nextFile);
          setFormPhotoPreview(nextPreview);
        }}
        disabled={submitting}
        label="Ürün fotoğrafı (zorunlu)"
        required
      />

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Not</label>
        <textarea
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Zimmet notu..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Zimmetleniyor…' : 'Zimmeti kaydet'}
        </button>
      </div>
    </form>
  );
};
