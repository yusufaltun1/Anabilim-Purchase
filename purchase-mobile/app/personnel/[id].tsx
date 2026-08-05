import { AccessDenied } from '@/components/auth/AccessDenied';
import { PersonnelStatusBadge } from '@/components/personnel';
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
import { personnelService } from '@/services/api/personnel.service';
import { fullName, type SchoolPersonnel } from '@/services/types/personnel.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function PersonnelDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const { canSystemManage } = useCapabilities();
  const [personnel, setPersonnel] = useState<SchoolPersonnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersonnel = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await personnelService.getPersonnelById(Number(id), token);
      setPersonnel(data);
    } catch (err: unknown) {
      setPersonnel(null);
      setError(err instanceof Error ? err.message : 'Personel detayı yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    setLoading(true);
    void loadPersonnel();
  }, [loadPersonnel]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPersonnel();
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
    if (!personnel || !token) return;
    Alert.alert(
      'Personeli sil',
      `"${fullName(personnel)}" personelini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await personnelService.deletePersonnel(personnel.id, token);
                router.replace('/personnel' as never);
              } catch (err: unknown) {
                Alert.alert(
                  'Hata',
                  err instanceof Error ? err.message : 'Personel silinirken bir hata oluştu'
                );
              }
            })();
          },
        },
      ]
    );
  };

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Personel Detayı', headerShown: false }} />
        <AccessDenied description="Personel detayını görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  if (loading && !personnel) {
    return (
      <>
        <Stack.Screen options={{ title: 'Personel Detayı', headerShown: false }} />
        <Screen padded={false} edges={['top', 'left', 'right']}>
          <Loading fullScreen label="Personel yükleniyor…" />
        </Screen>
      </>
    );
  }

  if (!personnel) {
    return (
      <>
        <Stack.Screen options={{ title: 'Personel Detayı', headerShown: false }} />
        <Screen edges={['top', 'left', 'right']}>
          <EmptyState
            title="Personel bulunamadı"
            description={error ?? 'Bu personel yüklenemedi'}
            icon="people-outline"
            actionTitle="Geri dön"
            onAction={() => router.replace('/personnel' as never)}
          />
        </Screen>
      </>
    );
  }

  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('tr-TR');
    } catch {
      return value;
    }
  };

  const formatDateTime = (value?: string) => {
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
      <Stack.Screen options={{ title: fullName(personnel), headerShown: false }} />
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
          <ScreenHeader
            title={fullName(personnel)}
            subtitle={`${personnel.role} · ${personnel.employmentType}`}
          />

          <PersonnelStatusBadge status={personnel.status} />

          <Section title="Personel bilgileri">
            <Card>
              <InfoRow label="Ad soyad" value={fullName(personnel)} />
              <InfoRow label="TC Kimlik No" value={personnel.tcNo} />
              <InfoRow label="Okul" value={personnel.schoolName || 'Okul bilgisi yok'} />
              <InfoRow label="Görev" value={personnel.role} />
              <InfoRow label="İstihdam türü" value={personnel.employmentType} />
              <InfoRow label="Durum" value={personnel.status} />
              <LinkRow
                label="E-posta"
                value={personnel.email}
                onPress={() => void openLink(`mailto:${personnel.email}`)}
              />
              <LinkRow
                label="Telefon"
                value={personnel.phone}
                onPress={() => void openLink(`tel:${personnel.phone}`)}
              />
              <InfoRow label="Adres" value={personnel.address} />
              <InfoRow label="İşe başlama" value={formatDate(personnel.startDate)} />
              {personnel.endDate ? (
                <InfoRow label="İşten ayrılma" value={formatDate(personnel.endDate)} />
              ) : null}
              {personnel.salary != null ? (
                <InfoRow
                  label="Maaş"
                  value={`${personnel.salary.toLocaleString('tr-TR')} TL`}
                />
              ) : null}
              {personnel.department ? (
                <InfoRow label="Departman" value={personnel.department} />
              ) : null}
              {personnel.branchSubject ? (
                <InfoRow label="Branş" value={personnel.branchSubject} />
              ) : null}
              {personnel.qualifications ? (
                <InfoRow label="Nitelikler" value={personnel.qualifications} />
              ) : null}
              {personnel.notes ? <InfoRow label="Notlar" value={personnel.notes} /> : null}
              {personnel.createdAt ? (
                <InfoRow label="Kayıt tarihi" value={formatDateTime(personnel.createdAt)} />
              ) : null}
              {personnel.updatedAt ? (
                <InfoRow label="Son güncelleme" value={formatDateTime(personnel.updatedAt)} />
              ) : null}
            </Card>
          </Section>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button
              title="Düzenle"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => router.push(`/personnel/edit/${personnel.id}` as never)}
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
              title="Telefon"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => void openLink(`tel:${personnel.phone}`)}
            />
            <Button
              title="E-posta"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => void openLink(`mailto:${personnel.email}`)}
            />
          </View>

          <Button title="Geri" variant="ghost" onPress={() => router.back()} />
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
