import { useEffect, useState } from 'react';
import { FormField } from '../common/FormField';
import { LocationHierarchyPickers } from '../common/LocationHierarchyPickers';
import { formSelect, formTextarea } from '../common/formStyles';
import { userService } from '../../services/user.service';
import { schoolService } from '../../services/school.service';
import { User } from '../../types/user';
import { School } from '../../types/school';

export type ProductAssignmentType = 'user' | 'location';

export interface ProductCreateAssignmentState {
  assignmentType: ProductAssignmentType;
  assignedUserId: string;
  assignedSchoolId: string;
  assignedLocationRootId: number | null;
  assignedLocationMiddleId: number | null;
  assignedLocationLeafId: number | null;
  locationDetails: string;
  expectedReturnDate: string;
  notes: string;
  formPhotoFile: File | null;
}

export const emptyProductAssignmentState = (): ProductCreateAssignmentState => ({
  assignmentType: 'user',
  assignedUserId: '',
  assignedSchoolId: '',
  assignedLocationRootId: null,
  assignedLocationMiddleId: null,
  assignedLocationLeafId: null,
  locationDetails: '',
  expectedReturnDate: '',
  notes: '',
  formPhotoFile: null,
});

interface ProductCreateAssignmentSectionProps {
  value: ProductCreateAssignmentState;
  onChange: (next: ProductCreateAssignmentState) => void;
  fieldErrors?: Record<string, string>;
  /** Konum zimmetinde üstteki paylaşılan Konum alanı kullanılır */
  useSharedLocationPickers?: boolean;
}

export const ProductCreateAssignmentSection = ({
  value,
  onChange,
  fieldErrors = {},
  useSharedLocationPickers = false,
}: ProductCreateAssignmentSectionProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      userService.getAllUsers(),
      schoolService.getAllSchools({ size: 500 }),
    ]).then(([userList, schoolRes]) => {
      setUsers(userList);
      setFilteredUsers(userList);
      setSchools(schoolRes.content ?? []);
    });
  }, []);

  const patch = (partial: Partial<ProductCreateAssignmentState>) => {
    onChange({ ...value, ...partial });
  };

  const handleUserSearch = (term: string) => {
    setUserSearchTerm(term);
    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }
    const lower = term.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(lower) ||
          u.lastName?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower)
      )
    );
  };

  const selectedUser = users.find((u) => u.id?.toString() === value.assignedUserId);

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Zimmet bilgileri</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          Depo seçilmediği için ürün kayıt sonrası doğrudan zimmetlenecek.
        </p>
      </div>

      <FormField label="Zimmet tipi" error={fieldErrors.assignmentType}>
        <select
          className={formSelect}
          value={value.assignmentType}
          onChange={(e) =>
            patch({
              assignmentType: e.target.value as ProductAssignmentType,
              assignedUserId: '',
              assignedSchoolId: '',
              assignedLocationRootId: null,
              assignedLocationMiddleId: null,
              assignedLocationLeafId: null,
              locationDetails: '',
            })
          }
        >
          <option value="user">Kişi zimmeti</option>
          <option value="location">Konum zimmeti</option>
        </select>
      </FormField>

      {value.assignmentType === 'user' ? (
        <>
          <FormField label="Kullanıcı" required error={fieldErrors.assignedUserId}>
            <div className="relative">
              <input
                type="text"
                value={
                  selectedUser
                    ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})`
                    : userSearchTerm
                }
                onChange={(e) => {
                  if (value.assignedUserId) {
                    patch({ assignedUserId: '' });
                    setUserSearchTerm(e.target.value);
                    handleUserSearch(e.target.value);
                  } else {
                    handleUserSearch(e.target.value);
                  }
                }}
                placeholder="Ad, soyad veya e-posta ile ara..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              />
              {userSearchTerm && !value.assignedUserId && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          patch({
                            assignedUserId: user.id!.toString(),
                            assignedSchoolId: user.schoolId?.toString() ?? '',
                          });
                          setUserSearchTerm('');
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {user.firstName} {user.lastName} ({user.email})
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500">Kullanıcı bulunamadı</p>
                  )}
                </div>
              )}
            </div>
          </FormField>

          {selectedUser && (
            <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Çalışma konumu: </span>
              {selectedUser.workLocationName ||
                (selectedUser.workLocationParentId
                  ? 'Tanımlı (detay yükleniyor)'
                  : 'Tanımlı değil')}
              {selectedUser.schoolName && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  Okul: {selectedUser.schoolName}
                </span>
              )}
            </div>
          )}

          <FormField label="Okul (opsiyonel)" error={fieldErrors.assignedSchoolId}>
            <select
              className={formSelect}
              value={value.assignedSchoolId}
              onChange={(e) => patch({ assignedSchoolId: e.target.value })}
            >
              <option value="">Seçin</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </FormField>
        </>
      ) : (
        <>
          {useSharedLocationPickers ? (
            <p className="text-sm text-gray-600 rounded-md border border-gray-200 bg-white px-3 py-2">
              Konum zimmeti için yukarıdaki <span className="font-medium">Konum</span> alanını
              doldurun. Varsayılan konum otomatik gelir; gerekirse değiştirebilirsiniz.
            </p>
          ) : (
            <>
              <FormField
                label="Konum"
                required
                error={fieldErrors.assignedLocationId || fieldErrors.defaultParentLocationId}
              >
                <LocationHierarchyPickers
                  rootId={value.assignedLocationRootId}
                  middleId={value.assignedLocationMiddleId}
                  leafId={value.assignedLocationLeafId}
                  onRootChange={(id) =>
                    patch({
                      assignedLocationRootId: id,
                      assignedLocationMiddleId: null,
                      assignedLocationLeafId: null,
                    })
                  }
                  onMiddleChange={(id) =>
                    patch({ assignedLocationMiddleId: id, assignedLocationLeafId: null })
                  }
                  onLeafChange={(id) => patch({ assignedLocationLeafId: id })}
                  showLeaf
                  autoSelectDefaults
                />
              </FormField>
            </>
          )}
          <FormField label="Konum detayı" error={fieldErrors.locationDetails}>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              value={value.locationDetails}
              onChange={(e) => patch({ locationDetails: e.target.value })}
              placeholder="Örn: 3. kat, oda 12"
            />
          </FormField>
        </>
      )}

      <FormField label="Beklenen iade tarihi" error={fieldErrors.expectedReturnDate}>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          value={value.expectedReturnDate}
          onChange={(e) => patch({ expectedReturnDate: e.target.value })}
        />
      </FormField>

      <FormField label="Ürün fotoğrafı (zorunlu)" required error={fieldErrors.formPhoto}>
        <input
          type="file"
          accept="image/jpeg,image/png"
          className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (formPhotoPreview) {
              URL.revokeObjectURL(formPhotoPreview);
            }
            setFormPhotoPreview(file ? URL.createObjectURL(file) : null);
            patch({ formPhotoFile: file });
          }}
        />
        {formPhotoPreview && (
          <img
            src={formPhotoPreview}
            alt="Seçilen ürün fotoğrafı"
            className="mt-2 h-16 w-16 rounded object-cover border border-gray-200"
          />
        )}
      </FormField>

      <FormField label="Not" error={fieldErrors.assignmentNotes}>
        <textarea
          rows={2}
          className={formTextarea}
          value={value.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          placeholder="Zimmet notu..."
        />
      </FormField>
    </div>
  );
};

export const resolveAssignmentLocationId = (state: ProductCreateAssignmentState): number | null =>
  state.assignedLocationLeafId ?? state.assignedLocationMiddleId ?? state.assignedLocationRootId;
