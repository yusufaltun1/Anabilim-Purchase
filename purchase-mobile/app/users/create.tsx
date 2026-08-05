import { AccessDenied } from '@/components/auth/AccessDenied';
import { UserForm } from '@/components/users';
import { Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { userService } from '@/services/api/user.service';
import type { CreateUserRequest, UserFormValues } from '@/services/types/user.types';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function UserCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [loading, setLoading] = useState(false);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Kullanıcı', headerShown: false }} />
        <AccessDenied description="Kullanıcı oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: UserFormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      const payload: CreateUserRequest = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        department: values.department,
        position: values.position,
        roles: values.roles,
        ...(values.managerId != null ? { manager: { id: values.managerId } } : {}),
      };
      await userService.createUser(payload, token);
      router.replace('/users' as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Kullanıcı', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni kullanıcı" subtitle="Sisteme kullanıcı ekleyin" />
        </View>
        <UserForm
          mode="create"
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </Screen>
    </>
  );
}
