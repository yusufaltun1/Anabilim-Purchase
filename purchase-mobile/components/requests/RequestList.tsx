import { EmptyState, Loading, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/contexts/AuthContext';
import { canDeleteRequest, canEditRequest } from '@/domain/requests/approvalRules';
import { useCapabilities } from '@/hooks/useCapabilities';
import { purchaseService } from '@/services/api/purchase.service';
import type { PurchaseRequest } from '@/services/types/purchase.types';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { RequestListItem } from './RequestListItem';

export type RequestListProps = {
  fetchFunction: (token: string) => Promise<PurchaseRequest[]>;
  onNav: (id: number) => void;
  listKey: 'my' | 'pending' | string;
  emptyTitle?: string;
  emptyDescription?: string;
  headerRight?: React.ReactNode;
  ListHeaderComponent?: React.ReactElement | null;
  enableActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export function RequestList({
  fetchFunction,
  onNav,
  listKey,
  emptyTitle = 'Talep bulunamadı',
  emptyDescription,
  ListHeaderComponent,
  enableActions,
  onEdit,
  onDelete,
}: RequestListProps) {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  const { hasCapability } = useCapabilities();
  const canEditCapability = hasCapability('REQUEST_EDIT');
  const { colors, spacing } = useAppTheme();

  const actionsEnabled = enableActions ?? listKey === 'my';

  const resolvedEmptyDescription =
    emptyDescription ??
    (listKey === 'pending'
      ? 'Onay bekleyen talep bulunmuyor'
      : 'Henüz bir talep oluşturmadınız');

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFunction(token);
      setRequests(data);
    } catch (err) {
      console.error(`Failed to fetch data for ${listKey}:`, err);
      setRequests([]);
      setError('Talepler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token, fetchFunction, listKey]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = useCallback(
    (id: number) => {
      if (onDelete) {
        onDelete(id);
        return;
      }
      if (!token) return;
      Alert.alert('Talebi sil', 'Bu talebi silmek istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await purchaseService.deleteRequest(id, token);
                await loadData();
              } catch (err) {
                console.error('Delete request failed:', err);
                Alert.alert(
                  'Hata',
                  err instanceof Error ? err.message : 'Talep silinirken bir hata oluştu'
                );
              }
            })();
          },
        },
      ]);
    },
    [onDelete, token, loadData]
  );

  if (loading && !refreshing) {
    return <Loading fullScreen label="Talepler yükleniyor…" />;
  }

  if (!loading && requests.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {ListHeaderComponent}
        <EmptyState
          title={error ? 'Yükleme başarısız' : emptyTitle}
          description={error ?? resolvedEmptyDescription}
          icon={error ? 'cloud-offline-outline' : 'document-text-outline'}
          actionTitle={error ? 'Tekrar dene' : undefined}
          onAction={error ? () => void loadData() : undefined}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => `${listKey}-${item.id}`}
      renderItem={({ item }) => {
        const isMyList = listKey === 'my';
        const showEdit =
          actionsEnabled && isMyList && canEditRequest(item, canEditCapability);
        const showDelete =
          actionsEnabled && isMyList && canDeleteRequest(item, user?.id, canEditCapability);

        return (
          <RequestListItem
            request={item}
            onPress={() => onNav(item.id)}
            variant={listKey === 'pending' ? 'pending' : 'my'}
            showEdit={showEdit}
            showDelete={showDelete}
            onEdit={showEdit && onEdit ? () => onEdit(item.id) : undefined}
            onDelete={showDelete ? () => handleDelete(item.id) : undefined}
          />
        );
      }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={
        ListHeaderComponent ? (
          <View style={{ marginBottom: spacing.md }}>{ListHeaderComponent}</View>
        ) : null
      }
      ListFooterComponent={
        requests.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {requests.length} talep
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
