import { EmptyState, Input, Loading, Select, Text } from '@/components/ui';
import { TRANSFER_STATUS_FILTERS } from '@/domain/custody/transferStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  transferService,
  type AssetTransfer,
} from '@/services/api/transfer.service';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { TransferListItem } from './TransferListItem';

export type TransferListMode = 'assigned' | 'manage';

export type TransferListProps = {
  mode: TransferListMode;
  onNav?: (id: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  ListHeaderComponent?: React.ReactElement | null;
  refreshKey?: number;
};

export function TransferList({
  mode,
  onNav,
  emptyTitle,
  emptyDescription,
  ListHeaderComponent,
  refreshKey = 0,
}: TransferListProps) {
  const { user, token } = useAuth();
  const { spacing } = useAppTheme();
  const [transfers, setTransfers] = useState<AssetTransfer[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setTransfers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'assigned') {
        if (!user?.id) {
          setTransfers([]);
          return;
        }
        let data = await transferService.getAssignedTransfers(user.id, token);
        if (statusFilter !== 'ALL') {
          data = data.filter((t) => t.status === statusFilter);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          data = data.filter(
            (t) =>
              t.transferCode?.toLowerCase().includes(q) ||
              t.sourceWarehouse?.name?.toLowerCase().includes(q) ||
              t.targetWarehouse?.name?.toLowerCase().includes(q)
          );
        }
        setTransfers(data);
        return;
      }

      if (searchQuery.trim()) {
        const page = await transferService.searchTransfers(searchQuery.trim(), token, 0, 50);
        let content = page.content;
        if (statusFilter !== 'ALL') {
          content = content.filter((t) => t.status === statusFilter);
        }
        setTransfers(content);
        return;
      }

      const data = await transferService.getAllTransfers(token, {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setTransfers(data);
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
      setTransfers([]);
      setError('Transferler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, mode, statusFilter, searchQuery]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const defaultEmptyTitle =
    mode === 'assigned' ? 'Transfer bulunamadı' : 'Transfer kaydı yok';
  const defaultEmptyDescription =
    mode === 'assigned'
      ? 'Size atanmış transfer bulunmuyor.'
      : 'Henüz transfer oluşturulmamış.';

  const filterHeader = (
    <View style={{ marginBottom: spacing.md, gap: spacing.sm }}>
      {mode === 'manage' ? (
        <Input
          label="Ara"
          placeholder="Transfer kodu veya depo…"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => void loadData()}
          containerStyle={{ marginBottom: 0 }}
        />
      ) : (
        <Input
          label="Ara"
          placeholder="Kod veya depo filtrele…"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
        />
      )}
      <Select
        label="Durum filtresi"
        options={TRANSFER_STATUS_FILTERS.map((f) => ({ label: f.label, value: f.value }))}
        value={statusFilter}
        onChange={(v) => setStatusFilter(v ?? 'ALL')}
        searchable={false}
        clearable={false}
        containerStyle={{ marginBottom: 0 }}
      />
    </View>
  );

  const combinedHeader = (
    <View>
      {ListHeaderComponent}
      {filterHeader}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {combinedHeader}
        <Loading fullScreen label="Transferler yükleniyor…" />
      </View>
    );
  }

  if (!loading && transfers.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {combinedHeader}
        <EmptyState
          title={error ? 'Yükleme başarısız' : emptyTitle ?? defaultEmptyTitle}
          description={error ?? emptyDescription ?? defaultEmptyDescription}
          icon={error ? 'cloud-offline-outline' : 'swap-horizontal-outline'}
          actionTitle={error ? 'Tekrar dene' : undefined}
          onAction={error ? () => void loadData() : undefined}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={transfers}
      keyExtractor={(item) => `transfer-${item.id}`}
      renderItem={({ item }) => (
        <TransferListItem
          transfer={item}
          onPress={onNav ? () => onNav(item.id) : undefined}
          showReceiveHint={mode === 'assigned'}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={<View style={{ marginBottom: spacing.md }}>{combinedHeader}</View>}
      ListFooterComponent={
        transfers.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {transfers.length} transfer
          </Text>
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
      }
    />
  );
}
