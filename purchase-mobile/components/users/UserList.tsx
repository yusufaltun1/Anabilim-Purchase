import { EmptyState, Input, Loading, Select, SegmentedControl, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { userService } from '@/services/api/user.service';
import { isUserActive, userDisplayName, type User } from '@/services/types/user.types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { UserListItem } from './UserListItem';

export type UserListProps = {
  onPress?: (user: User) => void;
  onEdit?: (user: User) => void;
  onCreate?: () => void;
  refreshKey?: number;
  ListHeaderComponent?: React.ReactElement | null;
};

type StatusFilter = 'all' | 'active';

export function UserList({
  onPress,
  onEdit,
  onCreate,
  refreshKey = 0,
  ListHeaderComponent,
}: UserListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setUsers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers(token);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
      setError('Kullanıcılar yüklenirken bir hata oluştu');
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

  const departments = useMemo(
    () =>
      Array.from(new Set(users.map((u) => u.department).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'tr')
      ),
    [users]
  );

  const roles = useMemo(
    () =>
      Array.from(new Set(users.flatMap((u) => u.roles ?? []))).sort((a, b) =>
        a.localeCompare(b, 'tr')
      ),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        userDisplayName(user).toLowerCase().includes(q) ||
        (user.email ?? '').toLowerCase().includes(q) ||
        (user.department ?? '').toLowerCase().includes(q) ||
        (user.position ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && isUserActive(user));
      const matchesDepartment = !departmentFilter || user.department === departmentFilter;
      const matchesRole = !roleFilter || (user.roles ?? []).includes(roleFilter);
      return matchesSearch && matchesStatus && matchesDepartment && matchesRole;
    });
  }, [users, searchTerm, statusFilter, departmentFilter, roleFilter]);

  const handleDelete = (user: User) => {
    const name = userDisplayName(user);
    Alert.alert('Kullanıcıyı sil', `"${name}" silinecek. Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!token) return;
            try {
              await userService.deleteUser(user.id, token);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : 'Kullanıcı silinirken bir hata oluştu';
              Alert.alert('Hata', message);
            }
          })();
        },
      },
    ]);
  };

  const filtersHeader = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      {ListHeaderComponent}
      <Input
        placeholder="Ad, e-posta, departman ara…"
        value={searchTerm}
        onChangeText={setSearchTerm}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
      <SegmentedControl
        options={[
          { key: 'all', label: 'Tümü' },
          { key: 'active', label: 'Aktif' },
        ]}
        value={statusFilter}
        onChange={(key) => setStatusFilter(key as StatusFilter)}
      />
      <Select
        label="Departman"
        placeholder="Tüm departmanlar"
        options={departments.map((d) => ({ label: d, value: d }))}
        value={departmentFilter}
        onChange={setDepartmentFilter}
      />
      <Select
        label="Rol"
        placeholder="Tüm roller"
        options={roles.map((r) => ({ label: r, value: r }))}
        value={roleFilter}
        onChange={setRoleFilter}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {filtersHeader}
        <Loading fullScreen label="Kullanıcılar yükleniyor…" />
      </View>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {filtersHeader}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Kullanıcı yok'}
          description={error ?? 'Henüz kullanıcı kaydı bulunmuyor'}
          icon={error ? 'cloud-offline-outline' : 'people-outline'}
          actionTitle={error ? 'Tekrar dene' : onCreate ? 'Yeni kullanıcı' : undefined}
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredUsers}
      keyExtractor={(item) => `user-${item.id}`}
      renderItem={({ item }) => (
        <UserListItem
          user={item}
          onPress={onPress ? () => onPress(item) : onEdit ? () => onEdit(item) : undefined}
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
      ListHeaderComponent={filtersHeader}
      ListEmptyComponent={
        <EmptyState
          title="Sonuç yok"
          description="Filtrelere uyan kullanıcı bulunamadı"
          icon="search-outline"
          actionTitle="Filtreleri temizle"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setDepartmentFilter(null);
            setRoleFilter(null);
          }}
        />
      }
      ListFooterComponent={
        filteredUsers.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {filteredUsers.length} / {users.length} kullanıcı
          </Text>
        ) : null
      }
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}
