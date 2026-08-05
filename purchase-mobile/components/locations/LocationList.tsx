import { EmptyState, Loading, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { locationService } from '@/services/api/location.service';
import {
  flattenLocationHierarchy,
  type FlatLocationRow,
  type Location,
} from '@/services/types/location.types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { LocationListItem } from './LocationListItem';

export type LocationListProps = {
  onPress?: (location: Location) => void;
  onEdit?: (location: Location) => void;
  onCreate?: () => void;
  canManage?: boolean;
  refreshKey?: number;
  ListHeaderComponent?: React.ReactElement | null;
};

export function LocationList({
  onPress,
  onEdit,
  onCreate,
  canManage = false,
  refreshKey = 0,
  ListHeaderComponent,
}: LocationListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setLocations([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setLocations(await locationService.getAllLocations(token));
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setLocations([]);
      setError('Konumlar yüklenirken bir hata oluştu');
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

  const rows = useMemo(() => flattenLocationHierarchy(locations), [locations]);

  const handleDelete = (location: Location) => {
    Alert.alert('Konumu sil', `"${location.name}" silinecek. Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!token) return;
            try {
              await locationService.deleteLocation(location.id, token);
              setLocations((prev) => prev.filter((l) => l.id !== location.id));
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : 'Konum silinirken bir hata oluştu';
              Alert.alert('Hata', message);
            }
          })();
        },
      },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {ListHeaderComponent}
        <Loading fullScreen label="Konumlar yükleniyor…" />
      </View>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {ListHeaderComponent}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Konum yok'}
          description={
            error ?? 'Henüz konum eklenmemiş. Üst → alt → detay olmak üzere en fazla 3 seviye.'
          }
          icon={error ? 'cloud-offline-outline' : 'location-outline'}
          actionTitle={error ? 'Tekrar dene' : onCreate ? 'Yeni konum' : undefined}
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item: FlatLocationRow) => `location-${item.location.id}`}
      renderItem={({ item }) => (
        <LocationListItem
          location={item.location}
          depth={item.depth}
          onPress={onPress ? () => onPress(item.location) : undefined}
          onEdit={canManage && onEdit ? () => onEdit(item.location) : undefined}
          onDelete={canManage ? () => handleDelete(item.location) : undefined}
        />
      )}
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
        rows.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {rows.length} konum
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
