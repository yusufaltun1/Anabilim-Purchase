import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Input,
  Loading,
  Text,
  TextArea,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { permissionService } from '@/services/api/permission.service';
import {
  emptyPermissionForm,
  validatePermissionForm,
  type CreatePermissionRequest,
  type Permission,
} from '@/services/types/permission.types';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';

export type PermissionListProps = {
  refreshKey?: number;
};

export function PermissionList({ refreshKey = 0 }: PermissionListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePermissionRequest>(emptyPermissionForm());

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setPermissions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setPermissions(await permissionService.getAllPermissions(token));
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setPermissions([]);
      setError('Permissionlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const setField = <K extends keyof CreatePermissionRequest>(
    key: K,
    value: CreatePermissionRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!token) return;
    const result = validatePermissionForm(form);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await permissionService.createPermission(
        {
          name: form.name.trim().toUpperCase(),
          displayName: form.displayName.trim(),
          description: form.description.trim(),
          resource: form.resource.trim().toUpperCase(),
          action: form.action.trim().toUpperCase(),
          isActive: form.isActive,
        },
        token
      );
      setForm(emptyPermissionForm());
      await loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Permission oluşturulamadı';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (permission: Permission) => {
    if (!permission.id) return;
    Alert.alert(
      'Permission sil',
      `"${permission.displayName || permission.name}" silinsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              if (!token || !permission.id) return;
              try {
                await permissionService.deletePermission(permission.id, token);
                setPermissions((prev) => prev.filter((p) => p.id !== permission.id));
              } catch (err: unknown) {
                const message =
                  err instanceof Error ? err.message : 'Permission silinemedi';
                Alert.alert('Hata', message);
              }
            })();
          },
        },
      ]
    );
  };

  const createForm = (
    <Card style={{ marginBottom: spacing.md }}>
      <Text variant="h3" style={{ marginBottom: spacing.md }}>
        Yeni permission
      </Text>
      <Input
        label="Ad"
        required
        placeholder="RESOURCE_ACTION"
        value={form.name}
        onChangeText={(v) => setField('name', v.toUpperCase())}
        autoCapitalize="characters"
      />
      <Input
        label="Görünen ad"
        required
        placeholder="Görünen ad"
        value={form.displayName}
        onChangeText={(v) => setField('displayName', v)}
      />
      <Input
        label="Resource"
        required
        placeholder="REQUEST"
        value={form.resource}
        onChangeText={(v) => setField('resource', v.toUpperCase())}
        autoCapitalize="characters"
      />
      <Input
        label="Action"
        required
        placeholder="READ"
        value={form.action}
        onChangeText={(v) => setField('action', v.toUpperCase())}
        autoCapitalize="characters"
      />
      <TextArea
        label="Açıklama"
        required
        placeholder="Kısa açıklama"
        value={form.description}
        onChangeText={(v) => setField('description', v)}
      />
      <Button
        title="Ekle"
        onPress={() => void handleCreate()}
        loading={saving}
        disabled={saving}
      />
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {createForm}
        <Loading fullScreen label="Permissionlar yükleniyor…" />
      </View>
    );
  }

  return (
    <FlatList
      data={permissions}
      keyExtractor={(item) => `perm-${item.id ?? item.name}`}
      renderItem={({ item }) => (
        <Card style={{ marginBottom: spacing.md }} padding={0}>
          <View style={{ padding: spacing.lg, gap: spacing.xs }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: spacing.sm,
              }}
            >
              <View style={{ flex: 1, gap: spacing.xxs }}>
                <Text variant="bodyStrong" numberOfLines={2}>
                  {item.displayName || item.name}
                </Text>
                <Text variant="caption">{item.name}</Text>
              </View>
              <Button
                title="Sil"
                variant="destructive"
                size="small"
                onPress={() => handleDelete(item)}
              />
            </View>
            <Text variant="caption" color={colors.textSecondary}>
              {item.resource} · {item.action}
            </Text>
            {item.description ? (
              <Text variant="caption" numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </Card>
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={
        <View style={{ marginBottom: spacing.sm }}>
          {error ? <ErrorBanner message={error} style={{ marginBottom: spacing.md }} /> : null}
          {createForm}
          <Text variant="h3" style={{ marginBottom: spacing.sm }}>
            Kayıtlı permission’lar
          </Text>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Permission yok'}
          description={error ?? 'Henüz permission kaydı bulunmuyor'}
          icon={error ? 'cloud-offline-outline' : 'key-outline'}
          actionTitle={error ? 'Tekrar dene' : undefined}
          onAction={error ? () => void loadData() : undefined}
        />
      }
      ListFooterComponent={
        permissions.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {permissions.length} permission
          </Text>
        ) : null
      }
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    />
  );
}
