import { AccessDenied } from '@/components/auth/AccessDenied';
import { UserAssignmentsSection, UserForm } from '@/components/users';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { userService } from '@/services/api/user.service';
import {
  resolveUserWorkLocationPayload,
  userDisplayName,
  type UpdateUserRequest,
  type User,
  type UserFormValues,
} from '@/services/types/user.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function UserEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id || !canSystemManage) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await userService.getUserById(Number(id), token);
        if (!cancelled) setUser(data);
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', err instanceof Error ? err.message : 'Kullanıcı yüklenemedi', [
            { text: 'Tamam', onPress: () => router.back() },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, id, canSystemManage, router]);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Kullanıcı Düzenle', headerShown: false }} />
        <AccessDenied description="Kullanıcı düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: UserFormValues) => {
    if (!token || !user) return;
    setSaving(true);
    try {
      const locationPayload = resolveUserWorkLocationPayload(
        values.workLocationLevel1Id,
        values.workLocationLevel2Id,
        values.workLocationLevel3Id
      );
      const payload: UpdateUserRequest = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        department: values.department,
        position: values.position,
        roles: values.roles,
        manager: values.managerId != null ? { id: values.managerId } : null,
        schoolId: values.schoolId,
        schoolTouched: true,
        ...locationPayload,
        workLocationHierarchyTouched: true,
        isActive: values.isActive,
      };
      await userService.updateUser(user.id, payload, token);
      router.replace('/users' as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kullanıcı güncellenemedi';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Kullanıcı Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Kullanıcı düzenle"
            subtitle={user ? userDisplayName(user) : 'Kullanıcı bilgilerini güncelleyin'}
          />
        </View>
        {loading || !user ? (
          <Loading fullScreen label="Kullanıcı yükleniyor…" />
        ) : (
          <UserForm
            mode="edit"
            userId={user.id}
            initialUser={user}
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            footer={<UserAssignmentsSection userId={user.id} />}
          />
        )}
      </Screen>
    </>
  );
}
