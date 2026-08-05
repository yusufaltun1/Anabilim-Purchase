import { AccessDenied } from '@/components/auth/AccessDenied';
import { RoleForm, type RoleFormSubmitPayload } from '@/components/roles';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { permissionService } from '@/services/api/permission.service';
import { roleService } from '@/services/api/role.service';
import type { Permission } from '@/services/types/permission.types';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function RoleCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalog, setCatalog] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !canSystemManage) {
      setCatalogLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await permissionService.getAllPermissions(token);
        if (!cancelled) {
          setCatalog(data.filter((p) => p.isActive !== false));
        }
      } catch (err) {
        console.error('Permission kataloğu yüklenemedi', err);
        if (!cancelled) {
          setError('Permission kataloğu yüklenemedi');
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, canSystemManage]);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Rol', headerShown: false }} />
        <AccessDenied description="Rol oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async ({ values, selectedPermissions }: RoleFormSubmitPayload) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await roleService.createRole(
        {
          name: values.name,
          displayName: values.displayName,
          description: values.description,
          isActive: values.isActive,
          isSystemRole: values.isSystemRole,
        },
        token
      );
      const created = await roleService.getRoleByName(values.name, token);
      if (created.id != null) {
        for (const permissionName of selectedPermissions) {
          try {
            await roleService.addPermissionToRole(created.id, permissionName, token);
          } catch (err) {
            console.warn(`Permission atanamadı: ${permissionName}`, err);
          }
        }
      }
      router.replace('/roles' as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rol oluşturulamadı';
      setError(message);
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Rol', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni rol" subtitle="Rol ve izinleri tanımlayın" />
        </View>
        {catalogLoading && catalog.length === 0 ? (
          <Loading fullScreen label="İzinler yükleniyor…" />
        ) : (
          <RoleForm
            mode="create"
            catalog={catalog}
            catalogLoading={catalogLoading}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
