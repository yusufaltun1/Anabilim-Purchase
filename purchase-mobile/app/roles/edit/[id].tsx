import { AccessDenied } from '@/components/auth/AccessDenied';
import { RoleForm, type RoleFormSubmitPayload } from '@/components/roles';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { permissionService } from '@/services/api/permission.service';
import { roleService } from '@/services/api/role.service';
import type { Permission } from '@/services/types/permission.types';
import {
  getRolePermissionNames,
  type Role,
  type RoleFormValues,
} from '@/services/types/role.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

export default function RoleEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roleId = Number(id);
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [catalog, setCatalog] = useState<Permission[]>([]);
  const [initialValues, setInitialValues] = useState<RoleFormValues | null>(null);
  const [initialPermissionNames, setInitialPermissionNames] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!token || !canSystemManage || !Number.isFinite(roleId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [roleData, catalogData] = await Promise.all([
        roleService.getRoleById(roleId, token),
        permissionService.getAllPermissions(token),
      ]);
      const activeCatalog = catalogData.filter((p) => p.isActive !== false);
      setRole(roleData);
      setCatalog(activeCatalog);
      setInitialValues({
        name: roleData.name,
        displayName: roleData.displayName,
        description: roleData.description,
        isActive: roleData.isActive,
        isSystemRole: roleData.isSystemRole,
      });
      setInitialPermissionNames(getRolePermissionNames(roleData));
    } catch (err) {
      console.error('Rol yüklenemedi', err);
      setError('Rol yüklenirken bir hata oluştu');
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [token, canSystemManage, roleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const lockSystemRole = useMemo(() => Boolean(role?.isSystemRole), [role?.isSystemRole]);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Rol Düzenle', headerShown: false }} />
        <AccessDenied description="Rol düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async ({ values, selectedPermissions }: RoleFormSubmitPayload) => {
    if (!token || !Number.isFinite(roleId)) return;
    setSaving(true);
    setError(null);
    try {
      await roleService.updateRole(
        roleId,
        {
          id: roleId,
          name: values.name,
          displayName: values.displayName,
          description: values.description,
          isActive: values.isActive,
          isSystemRole: values.isSystemRole,
        },
        token
      );

      const currentRole = await roleService.getRoleById(roleId, token);
      const currentPermissions = new Set(getRolePermissionNames(currentRole));
      const selected = new Set(selectedPermissions);

      for (const p of selected) {
        if (!currentPermissions.has(p)) {
          try {
            await roleService.addPermissionToRole(roleId, p, token);
          } catch (err) {
            console.warn(`Permission atanamadı: ${p}`, err);
          }
        }
      }
      for (const p of currentPermissions) {
        if (!selected.has(p)) {
          try {
            await roleService.removePermissionFromRole(roleId, p, token);
          } catch (err) {
            console.warn(`Permission kaldırılamadı: ${p}`, err);
          }
        }
      }

      router.replace('/roles' as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rol güncellenemedi';
      setError(message);
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Rol Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Rol düzenle"
            subtitle={role?.displayName ? `"${role.displayName}"` : 'Rol bilgilerini güncelleyin'}
          />
        </View>
        {loading ? (
          <Loading fullScreen label="Rol yükleniyor…" />
        ) : !role || !initialValues ? (
          <RoleForm
            mode="edit"
            catalog={[]}
            catalogLoading={false}
            loading={false}
            error={error ?? 'Rol bulunamadı'}
            onSubmit={async () => undefined}
            onCancel={() => router.back()}
          />
        ) : (
          <RoleForm
            mode="edit"
            initialValues={initialValues}
            lockSystemRole={lockSystemRole}
            initialPermissionNames={initialPermissionNames}
            catalog={catalog}
            loading={saving}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
