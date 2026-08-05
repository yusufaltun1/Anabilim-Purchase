import { EmptyState, Input, Loading, SegmentedControl, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { roleService } from '@/services/api/role.service';
import type { Role, RoleFilter } from '@/services/types/role.types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { RoleListItem } from './RoleListItem';

const FILTER_OPTIONS: Array<{ key: RoleFilter; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'active', label: 'Aktif' },
  { key: 'system', label: 'Sistem' },
  { key: 'custom', label: 'Özel' },
];

export type RoleListProps = {
  onPress?: (role: Role) => void;
  onEdit?: (role: Role) => void;
  onCreate?: () => void;
  refreshKey?: number;
};

export function RoleList({ onPress, onEdit, onCreate, refreshKey = 0 }: RoleListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setRoles([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data: Role[];
      if (filter === 'active') {
        data = await roleService.getActiveRoles(token);
      } else if (filter === 'system') {
        data = await roleService.getSystemRoles(token);
      } else {
        data = await roleService.getAllRoles(token);
      }
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setRoles([]);
      setError('Roller yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredRoles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return roles.filter((role) => {
      const matchesSearch =
        !q ||
        role.name.toLowerCase().includes(q) ||
        role.displayName.toLowerCase().includes(q) ||
        (role.description ?? '').toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (filter === 'active') return role.isActive;
      if (filter === 'system') return role.isSystemRole;
      if (filter === 'custom') return !role.isSystemRole;
      return true;
    });
  }, [roles, searchTerm, filter]);

  const handleDelete = (role: Role) => {
    if (!role.id || role.isSystemRole) return;
    Alert.alert('Rolü sil', `"${role.displayName}" silinecek. Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!token || !role.id) return;
            try {
              await roleService.deleteRole(role.id, token);
              setRoles((prev) => prev.filter((r) => r.id !== role.id));
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : 'Rol silinirken bir hata oluştu';
              Alert.alert('Hata', message);
            }
          })();
        },
      },
    ]);
  };

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <Input
        placeholder="Rol ara…"
        value={searchTerm}
        onChangeText={setSearchTerm}
        returnKeyType="search"
      />
      <SegmentedControl
        options={FILTER_OPTIONS}
        value={filter}
        onChange={(key) => setFilter(key as RoleFilter)}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <Loading fullScreen label="Roller yükleniyor…" />
      </View>
    );
  }

  if (!loading && filteredRoles.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Rol yok'}
          description={
            error ??
            (searchTerm || filter !== 'all'
              ? 'Arama kriterlerinize uygun rol bulunamadı'
              : 'Henüz rol kaydı bulunmuyor')
          }
          icon={error ? 'cloud-offline-outline' : 'shield-outline'}
          actionTitle={
            error ? 'Tekrar dene' : !searchTerm && filter === 'all' && onCreate ? 'Yeni rol' : undefined
          }
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredRoles}
      keyExtractor={(item) => `role-${item.id ?? item.name}`}
      renderItem={({ item }) => (
        <RoleListItem
          role={item}
          onPress={
            onPress
              ? () => onPress(item)
              : onEdit
                ? () => onEdit(item)
                : undefined
          }
          onEdit={onEdit ? () => onEdit(item) : undefined}
          onDelete={() => handleDelete(item)}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={<View style={{ marginBottom: spacing.sm }}>{header}</View>}
      ListFooterComponent={
        filteredRoles.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {filteredRoles.length} rol
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
