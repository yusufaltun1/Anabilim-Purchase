import {
  Button,
  DateTimeField,
  ImagePickerField,
  LocationHierarchyPickers,
  resolveSelectedLocationId,
  SegmentedControl,
  Text,
  TextArea,
  UserSearchSelect,
  useToast,
  type LocationHierarchyValue,
  type PickedImage,
  type UserOption,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { assignmentService } from '@/services/api/assignment.service';
import { userService } from '@/services/api/user.service';
import type { User } from '@/services/types/user.types';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

export type StockItemAssignmentFormProps = {
  productId: number;
  stockItemId: number;
  serialLabel?: string;
  onSuccess: () => void;
};

type AssignmentType = 'user' | 'location';

type UserOptionWithLocation = UserOption & {
  workLocationName?: string;
  schoolName?: string;
  schoolId?: number | null;
};

function toIsoDate(date: Date | null): string | undefined {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const emptyHierarchy: LocationHierarchyValue = {
  level1Id: null,
  level2Id: null,
  level3Id: null,
};

export function StockItemAssignmentForm({
  productId,
  stockItemId,
  serialLabel,
  onSuccess,
}: StockItemAssignmentFormProps) {
  const { token } = useAuth();
  const { spacing, colors } = useAppTheme();
  const { showToast } = useToast();

  const [assignmentType, setAssignmentType] = useState<AssignmentType>('user');
  const [users, setUsers] = useState<UserOptionWithLocation[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [locationValue, setLocationValue] = useState<LocationHierarchyValue>(emptyHierarchy);
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setUsersLoading(true);
    userService
      .getActiveUsers(token)
      .then((list: User[]) =>
        setUsers(
          list.map((u) => ({
            id: u.id,
            fullName:
              u.fullName || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || `Kullanıcı #${u.id}`,
            email: u.email,
            department: u.department,
            workLocationName: u.workLocationName,
            schoolName: u.schoolName,
            schoolId: u.schoolId,
          }))
        )
      )
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, [token]);

  const selectedUser = useMemo(
    () => users.find((u) => String(u.id) === String(assignedUserId)),
    [users, assignedUserId]
  );

  const typeOptions = useMemo(
    () => [
      { key: 'user', label: 'Kişi', icon: 'person' as const },
      { key: 'location', label: 'Konum', icon: 'location' as const },
    ],
    []
  );

  const handleSubmit = async () => {
    if (!token) return;

    if (!photo?.uri) {
      showToast({ message: 'Zimmet için ürün fotoğrafı zorunludur', tone: 'error' });
      return;
    }

    const photoPayload = {
      uri: photo.uri,
      fileName: photo.fileName || undefined,
      mimeType: photo.mimeType || undefined,
    };

    if (assignmentType === 'location') {
      const assignedLocationId = resolveSelectedLocationId(locationValue);
      if (!assignedLocationId) {
        showToast({ message: 'Lütfen bir konum seçin', tone: 'error' });
        return;
      }

      try {
        setSubmitting(true);
        const created = await assignmentService.createAssignment(
          {
            productId,
            stockItemId,
            assignedLocationId,
            expectedReturnDate: toIsoDate(expectedReturnDate),
            notes: notes.trim() || undefined,
          },
          token,
          photoPayload
        );

        if (created?.id) {
          try {
            await assignmentService.downloadAssignmentForm(created.id, token);
            showToast({
              message: 'Konum zimmeti oluşturuldu. Fotoğraf eklendi, form indirildi.',
              tone: 'success',
            });
          } catch (err) {
            showToast({
              message:
                err instanceof Error ? err.message : 'Zimmet oluşturuldu ancak form indirilemedi.',
              tone: 'error',
            });
          }
        } else {
          showToast({ message: 'Konum zimmeti başarıyla oluşturuldu', tone: 'success' });
        }
        onSuccess();
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : 'Zimmet oluşturulamadı',
          tone: 'error',
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!assignedUserId) {
      showToast({ message: 'Lütfen bir kullanıcı seçin', tone: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const created = await assignmentService.createAssignment(
        {
          productId,
          stockItemId,
          assignedUserId: Number(assignedUserId),
          assignedSchoolId: selectedUser?.schoolId ?? undefined,
          expectedReturnDate: toIsoDate(expectedReturnDate),
          notes: notes.trim() || undefined,
        },
        token,
        photoPayload
      );

      if (created?.id) {
        try {
          await assignmentService.downloadAssignmentForm(created.id, token);
          showToast({
            message: 'Zimmet oluşturuldu. Fotoğraf eklendi, form indirildi.',
            tone: 'success',
          });
        } catch (err) {
          showToast({
            message:
              err instanceof Error ? err.message : 'Zimmet oluşturuldu ancak form indirilemedi.',
            tone: 'error',
          });
        }
      } else {
        showToast({ message: 'Zimmet başarıyla oluşturuldu', tone: 'success' });
      }
      onSuccess();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Zimmet oluşturulamadı',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: spacing.md,
        backgroundColor: colors.backgroundElevated,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
        <Text variant="h3">Zimmet et</Text>
        {serialLabel ? (
          <Text variant="caption" numberOfLines={1} style={{ flexShrink: 1 }}>
            {serialLabel}
          </Text>
        ) : null}
      </View>

      <SegmentedControl
        options={typeOptions}
        value={assignmentType}
        onChange={(key) => setAssignmentType(key as AssignmentType)}
      />

      {assignmentType === 'location' ? (
        <LocationHierarchyPickers
          value={locationValue}
          onChange={setLocationValue}
          showLeaf
          autoSelectDefaults={false}
          disabled={submitting}
          required
        />
      ) : (
        <>
          <UserSearchSelect
            label="Kullanıcı"
            required
            users={users}
            value={assignedUserId}
            onChange={setAssignedUserId}
            disabled={submitting || usersLoading}
            placeholder={usersLoading ? 'Kullanıcılar yükleniyor…' : 'Kullanıcı seçiniz'}
          />
          {selectedUser ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: spacing.sm,
                gap: 2,
              }}
            >
              <Text variant="caption" color={colors.textSecondary}>
                Çalışma konumu:{' '}
                {selectedUser.workLocationName || 'Tanımlı değil'}
              </Text>
              {selectedUser.schoolName ? (
                <Text variant="caption" color={colors.textSecondary}>
                  Okul: {selectedUser.schoolName}
                </Text>
              ) : null}
              <Text variant="caption" color={colors.textSecondary}>
                Konum, kullanıcının kartındaki çalışma konumundan otomatik alınır.
              </Text>
            </View>
          ) : null}
        </>
      )}

      <DateTimeField
        label="Beklenen iade tarihi"
        mode="date"
        value={expectedReturnDate}
        onChange={setExpectedReturnDate}
        clearable
        disabled={submitting}
      />

      <ImagePickerField
        label="Ürün fotoğrafı"
        value={photo}
        onChange={setPhoto}
        source="both"
        disabled={submitting}
        required
        helper="Zorunlu — zimmet formuna eklenir"
      />

      <TextArea
        label="Not"
        value={notes}
        onChangeText={setNotes}
        placeholder="Zimmet notu..."
        editable={!submitting}
      />

      <Button
        title={submitting ? 'Zimmetleniyor…' : 'Zimmeti kaydet'}
        onPress={() => void handleSubmit()}
        loading={submitting}
        fullWidth
      />
    </View>
  );
}
