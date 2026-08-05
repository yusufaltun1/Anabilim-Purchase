import { AccessDenied } from '@/components/auth/AccessDenied';
import { LocationLevelBadge } from '@/components/locations';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Loading,
  Screen,
  ScreenHeader,
  Section,
  Text,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import { assignmentService } from '@/services/api/assignment.service';
import { locationService } from '@/services/api/location.service';
import {
  LOCATION_LEVEL_LABELS,
  formatLocationDate,
  type Location,
  type LocationProductSummary,
} from '@/services/types/location.types';
import {
  AssignmentStatus,
  type Assignment,
} from '@/services/types/product.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function LocationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const { canInventoryView, canInventoryManage } = useCapabilities();

  const [location, setLocation] = useState<Location | null>(null);
  const [products, setProducts] = useState<LocationProductSummary[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    const locationId = Number(id);
    if (!Number.isFinite(locationId) || locationId <= 0) {
      setError('Geçersiz konum ID');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const loc = await locationService.getLocationById(locationId, token);
      setLocation(loc);
      const [productList, assignmentList] = await Promise.all([
        locationService.getProductsByLocationId(locationId, token).catch(() => []),
        assignmentService.getAssignmentsByLocationId(locationId, token).catch(() => []),
      ]);
      setProducts(productList);
      setAssignments(
        assignmentList.filter(
          (a) => a.status === AssignmentStatus.ACTIVE || a.canBeReturned
        )
      );
    } catch (err: unknown) {
      setLocation(null);
      setError(err instanceof Error ? err.message : 'Konum yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    setLoading(true);
    void loadDetail();
  }, [loadDetail]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDetail();
    setRefreshing(false);
  };

  const handleDelete = () => {
    if (!location || !token) return;
    Alert.alert('Konumu sil', `"${location.name}" silinecek. Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              setDeleting(true);
              await locationService.deleteLocation(location.id, token);
              router.replace('/locations');
            } catch (err: unknown) {
              Alert.alert('Hata', err instanceof Error ? err.message : 'Konum silinemedi');
            } finally {
              setDeleting(false);
            }
          })();
        },
      },
    ]);
  };

  if (!canInventoryView) {
    return (
      <>
        <Stack.Screen options={{ title: 'Konum Detayı', headerShown: false }} />
        <AccessDenied description="Konum detayını görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  if (loading && !location) {
    return (
      <>
        <Stack.Screen options={{ title: 'Konum Detayı', headerShown: false }} />
        <Screen padded={false} edges={['top', 'left', 'right']}>
          <Loading fullScreen label="Konum yükleniyor…" />
        </Screen>
      </>
    );
  }

  if (!location) {
    return (
      <>
        <Stack.Screen options={{ title: 'Konum Detayı', headerShown: false }} />
        <Screen edges={['top', 'left', 'right']}>
          <EmptyState
            title="Konum bulunamadı"
            description={error ?? 'Bu konum yüklenemedi'}
            icon="location-outline"
            actionTitle="Geri dön"
            onAction={() => router.replace('/locations')}
          />
        </Screen>
      </>
    );
  }

  const levelLabel =
    location.level != null
      ? LOCATION_LEVEL_LABELS[location.level] ?? `${location.level}. seviye`
      : null;

  return (
    <>
      <Stack.Screen options={{ title: location.name, headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing['3xl'],
            gap: spacing.md,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title={location.name} subtitle={location.path || undefined} />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' }}>
            <LocationLevelBadge level={location.level} />
            {location.isDefault ? <Chip label="Varsayılan" selected disabled /> : null}
          </View>

          <Section title="Bilgiler">
            <Card>
              <InfoRow label="Konum adı" value={location.name} />
              <InfoRow label="Tam yol" value={location.path || location.name} />
              {levelLabel ? <InfoRow label="Seviye" value={levelLabel} /> : null}
              {location.parentName ? (
                <InfoRow label="Üst konum" value={location.parentName} />
              ) : null}
              <InfoRow label="Açıklama" value={location.description || '—'} />
              <InfoRow label="Oluşturulma" value={formatLocationDate(location.createdAt)} />
              <InfoRow label="Son güncelleme" value={formatLocationDate(location.updatedAt)} />
            </Card>
          </Section>

          <Section title="Konumdaki ürünler">
            {products.length === 0 ? (
              <Card>
                <Text variant="caption" color={colors.textMuted}>
                  Bu konuma bağlı ürün bulunamadı.
                </Text>
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {products.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => router.push(`/product-detail/${product.id}`)}
                  >
                    <Card>
                      <Text variant="bodyStrong" numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text
                        variant="caption"
                        color={colors.textMuted}
                        style={{ marginTop: spacing.xxs }}
                      >
                        {[product.code, product.isActive === false ? 'Pasif' : null]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </Text>
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          </Section>

          <Section title="Konum zimmetleri">
            {assignments.length === 0 ? (
              <Card>
                <Text variant="caption" color={colors.textMuted}>
                  Bu konumda aktif zimmet bulunmuyor.
                </Text>
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <Text variant="bodyStrong" numberOfLines={2}>
                      {assignment.productName || `Ürün #${assignment.productId}`}
                    </Text>
                    <Text
                      variant="caption"
                      color={colors.textMuted}
                      style={{ marginTop: spacing.xxs }}
                    >
                      {[
                        assignment.productCode,
                        assignment.serialNumber,
                        assignment.assignedUserName,
                        assignment.status,
                        `Adet: ${assignment.quantity}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                    {assignment.notes ? (
                      <Text variant="caption" style={{ marginTop: spacing.xs }}>
                        {assignment.notes}
                      </Text>
                    ) : null}
                  </Card>
                ))}
              </View>
            )}
          </Section>

          {canInventoryManage ? (
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
              <Button
                title="Düzenle"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => router.push(`/locations/edit/${location.id}`)}
                disabled={deleting}
              />
              <Button
                title="Sil"
                variant="destructive"
                style={{ flex: 1 }}
                onPress={handleDelete}
                loading={deleting}
                disabled={deleting}
              />
            </View>
          ) : null}
        </ScrollView>
      </Screen>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { spacing, colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
        paddingVertical: spacing.xs,
      }}
    >
      <Text variant="caption" color={colors.textMuted} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text variant="bodyStrong" style={{ flex: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}
