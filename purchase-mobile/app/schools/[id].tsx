import { AccessDenied } from '@/components/auth/AccessDenied';
import { SchoolStatusBadge } from '@/components/schools';
import {
  Button,
  Card,
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
import { schoolService } from '@/services/api/school.service';
import { getSchoolTypeLabel, type School } from '@/services/types/school.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function SchoolDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const { canSystemManage } = useCapabilities();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchool = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await schoolService.getSchoolById(Number(id), token);
      setSchool(data);
    } catch (err: unknown) {
      setSchool(null);
      setError(err instanceof Error ? err.message : 'Okul detayı yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    setLoading(true);
    void loadSchool();
  }, [loadSchool]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchool();
    setRefreshing(false);
  };

  const openLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Bu bağlantı açılamadı');
      }
    } catch {
      Alert.alert('Hata', 'Bağlantı açılırken bir sorun oluştu');
    }
  };

  const handleDelete = () => {
    if (!school || !token) return;
    Alert.alert('Okulu sil', `"${school.name}" silinecek. Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await schoolService.deleteSchool(school.id, token);
              router.replace('/schools' as never);
            } catch (err: unknown) {
              Alert.alert(
                'Hata',
                err instanceof Error ? err.message : 'Okul silinirken bir hata oluştu'
              );
            }
          })();
        },
      },
    ]);
  };

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Okul Detayı', headerShown: false }} />
        <AccessDenied description="Okul detayını görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  if (loading && !school) {
    return (
      <>
        <Stack.Screen options={{ title: 'Okul Detayı', headerShown: false }} />
        <Screen padded={false} edges={['top', 'left', 'right']}>
          <Loading fullScreen label="Okul yükleniyor…" />
        </Screen>
      </>
    );
  }

  if (!school) {
    return (
      <>
        <Stack.Screen options={{ title: 'Okul Detayı', headerShown: false }} />
        <Screen edges={['top', 'left', 'right']}>
          <EmptyState
            title="Okul bulunamadı"
            description={error ?? 'Bu okul yüklenemedi'}
            icon="school-outline"
            actionTitle="Geri dön"
            onAction={() => router.replace('/schools' as never)}
          />
        </Screen>
      </>
    );
  }

  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: school.name, headerShown: false }} />
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
          <ScreenHeader title={school.name} subtitle={school.code} />

          <SchoolStatusBadge isActive={school.isActive} />

          <Section title="Okul bilgileri">
            <Card>
              <InfoRow label="Okul adı" value={school.name} />
              <InfoRow label="Okul kodu" value={school.code} />
              <InfoRow label="Okul türü" value={getSchoolTypeLabel(school.schoolType)} />
              <InfoRow label="Müdür" value={school.principalName} />
              <InfoRow label="Şehir" value={school.city} />
              <InfoRow label="İlçe" value={school.district} />
              <InfoRow label="Adres" value={school.address} />
              <LinkRow
                label="Telefon"
                value={school.phone}
                onPress={() => void openLink(`tel:${school.phone}`)}
              />
              <LinkRow
                label="E-posta"
                value={school.email}
                onPress={() => void openLink(`mailto:${school.email}`)}
              />
              <InfoRow
                label="Öğrenci kapasitesi"
                value={`${school.studentCapacity.toLocaleString('tr-TR')} öğrenci`}
              />
              {school.createdAt ? (
                <InfoRow label="Oluşturulma" value={formatDate(school.createdAt)} />
              ) : null}
              {school.updatedAt ? (
                <InfoRow label="Son güncelleme" value={formatDate(school.updatedAt)} />
              ) : null}
            </Card>
          </Section>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button
              title="Düzenle"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => router.push(`/schools/edit/${school.id}` as never)}
            />
            <Button
              title="Sil"
              variant="destructive"
              style={{ flex: 1 }}
              onPress={handleDelete}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button
              title="Ara"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => void openLink(`tel:${school.phone}`)}
            />
            <Button
              title="E-posta"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => void openLink(`mailto:${school.email}`)}
            />
          </View>
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
        {value || '—'}
      </Text>
    </View>
  );
}

function LinkRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
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
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        <Text variant="bodyStrong" color={colors.primary} style={{ textAlign: 'right' }}>
          {value || '—'}
        </Text>
      </Pressable>
    </View>
  );
}
