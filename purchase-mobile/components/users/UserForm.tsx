import {
  Button,
  Card,
  Checkbox,
  Input,
  LocationHierarchyPickers,
  MultiSelect,
  Select,
  Text,
  UserSearchSelect,
  type LocationHierarchyValue,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { locationService } from '@/services/api/location.service';
import { roleService } from '@/services/api/role.service';
import { schoolService } from '@/services/api/school.service';
import { userService } from '@/services/api/user.service';
import type { Location } from '@/services/types/location.types';
import {
  emptyUserForm,
  resolveUserWorkLocationLevels,
  userDisplayName,
  userToForm,
  validateUserForm,
  type User,
  type UserFormValues,
} from '@/services/types/user.types';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type UserFormProps = {
  mode: 'create' | 'edit';
  /** Edit modunda mevcut kullanıcı (yönetici listesinden çıkarılır) */
  userId?: number;
  initialValues?: Partial<UserFormValues>;
  initialUser?: User | null;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  /** Edit kaydı sonrası zimmet bölümü */
  footer?: React.ReactNode;
};

export function UserForm({
  mode,
  userId,
  initialValues,
  initialUser,
  onSubmit,
  onCancel,
  loading = false,
  footer,
}: UserFormProps) {
  const { token } = useAuth();
  const { spacing } = useAppTheme();
  const [values, setValues] = useState<UserFormValues>(() => ({
    ...emptyUserForm(),
    ...initialValues,
  }));
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [schools, setSchools] = useState<{ label: string; value: number }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setOptionsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setOptionsLoading(true);
        const [roles, activeUsers, schoolList, locationList] = await Promise.all([
          roleService.getActiveRoles(token).catch(() => []),
          userService.getActiveUsers(token).catch(() => [] as User[]),
          mode === 'edit'
            ? schoolService.getActiveSchools(token).catch(() => [])
            : Promise.resolve([]),
          mode === 'edit'
            ? locationService.getAllLocations(token).catch(() => [] as Location[])
            : Promise.resolve([] as Location[]),
        ]);
        if (cancelled) return;

        setRoleOptions(
          roles.map((r) => ({
            label: r.displayName || r.name,
            value: r.name,
          }))
        );
        setManagers(activeUsers.filter((u) => (userId != null ? u.id !== userId : true)));
        setSchools(schoolList.map((s) => ({ label: s.name, value: s.id })));

        if (initialUser && mode === 'edit') {
          const levels = resolveUserWorkLocationLevels(
            locationList,
            initialUser.workLocationParentId,
            initialUser.workLocationChildId
          );
          setValues((prev) => ({
            ...prev,
            ...userToForm(initialUser, levels),
            ...initialValues,
          }));
        } else if (initialValues) {
          setValues((prev) => ({ ...prev, ...initialValues }));
        }
      } catch (err) {
        console.error('User form options load failed:', err);
        if (!cancelled) {
          Alert.alert('Hata', 'Form seçenekleri yüklenirken bir sorun oluştu');
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once when token/user ready
  }, [token, mode, userId, initialUser?.id]);

  const setField = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const hierarchyValue: LocationHierarchyValue = useMemo(
    () => ({
      level1Id: values.workLocationLevel1Id,
      level2Id: values.workLocationLevel2Id,
      level3Id: values.workLocationLevel3Id,
    }),
    [values.workLocationLevel1Id, values.workLocationLevel2Id, values.workLocationLevel3Id]
  );

  const handleHierarchyChange = (next: LocationHierarchyValue) => {
    setValues((prev) => ({
      ...prev,
      workLocationLevel1Id: next.level1Id == null ? null : Number(next.level1Id),
      workLocationLevel2Id: next.level2Id == null ? null : Number(next.level2Id),
      workLocationLevel3Id: next.level3Id == null ? null : Number(next.level3Id),
    }));
  };

  const managerOptions = useMemo(
    () =>
      managers.map((m) => ({
        id: m.id,
        fullName: userDisplayName(m),
        email: m.email,
        department: m.department,
      })),
    [managers]
  );

  const handleSubmit = async () => {
    const result = validateUserForm(values);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      ...values,
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      department: values.department.trim(),
      position: values.position.trim(),
    });
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
    >
      <Card>
        <Input
          label="E-posta"
          required
          placeholder="ornek@anabilim.com"
          value={values.email}
          onChangeText={(v) => setField('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Ad"
          required
          placeholder="Ad"
          value={values.firstName}
          onChangeText={(v) => setField('firstName', v)}
          autoCapitalize="words"
        />
        <Input
          label="Soyad"
          required
          placeholder="Soyad"
          value={values.lastName}
          onChangeText={(v) => setField('lastName', v)}
          autoCapitalize="words"
        />
        <Input
          label="Telefon"
          required
          placeholder="+905551234567"
          value={values.phone}
          onChangeText={(v) => setField('phone', v)}
          keyboardType="phone-pad"
        />
        <Input
          label="Departman"
          required
          placeholder="IT, Finans, İK vb."
          value={values.department}
          onChangeText={(v) => setField('department', v)}
        />
        <Input
          label="Pozisyon"
          required
          placeholder="Yazılım Geliştirici vb."
          value={values.position}
          onChangeText={(v) => setField('position', v)}
        />
        <UserSearchSelect
          label="Yönetici"
          placeholder={optionsLoading ? 'Yükleniyor…' : 'Yönetici seçin'}
          users={managerOptions}
          value={values.managerId}
          onChange={(id) => setField('managerId', id ? Number(id) : null)}
          disabled={optionsLoading}
        />
        <MultiSelect
          label="Roller"
          required
          placeholder={optionsLoading ? 'Yükleniyor…' : 'Rol seçin'}
          options={roleOptions}
          value={values.roles}
          onChange={(roles) => setField('roles', roles)}
          disabled={optionsLoading}
        />
      </Card>

      {mode === 'edit' ? (
        <Card>
          <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
            Zimmet formu bilgileri
          </Text>
          <Text variant="caption" style={{ marginBottom: spacing.md }}>
            Excel zimmet formunda kullanılır.
          </Text>
          <Select
            label="Şirket / Okul"
            placeholder={optionsLoading ? 'Yükleniyor…' : 'Okul seçin'}
            options={schools}
            value={values.schoolId}
            onChange={(id) => setField('schoolId', id)}
            disabled={optionsLoading}
          />
          <Text variant="label" style={{ marginBottom: spacing.sm }}>
            Çalışma lokasyonu
          </Text>
          <LocationHierarchyPickers
            value={hierarchyValue}
            onChange={handleHierarchyChange}
            disabled={optionsLoading}
            showLeaf
          />
          <Checkbox
            label="Aktif"
            checked={values.isActive}
            onChange={(checked) => setField('isActive', checked)}
          />
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button title="İptal" onPress={onCancel} variant="outline" style={{ flex: 1 }} disabled={loading} />
        <Button
          title={mode === 'create' ? 'Oluştur' : 'Kaydet'}
          onPress={() => void handleSubmit()}
          loading={loading}
          disabled={loading}
          style={{ flex: 1 }}
        />
      </View>

      {footer}
    </ScrollView>
  );
}
