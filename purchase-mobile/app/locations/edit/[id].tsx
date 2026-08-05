import { AccessDenied } from '@/components/auth/AccessDenied';
import { LocationForm } from '@/components/locations';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { locationService } from '@/services/api/location.service';
import {
  emptyLocationForm,
  parentPickersForLocation,
  resolveParentForNewLocation,
  type Location,
  type LocationFormValues,
} from '@/services/types/location.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

export default function LocationEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canInventoryManage } = useCapabilities();
  const [location, setLocation] = useState<Location | null>(null);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id || !canInventoryManage) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const locationId = Number(id);
        const [loc, all] = await Promise.all([
          locationService.getLocationById(locationId, token),
          locationService.getAllLocations(token),
        ]);
        if (!cancelled) {
          setLocation(loc);
          setAllLocations(all);
        }
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', err instanceof Error ? err.message : 'Konum yüklenemedi', [
            { text: 'Tamam', onPress: () => router.back() },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, id, canInventoryManage, router]);

  const initialValues = useMemo((): LocationFormValues | undefined => {
    if (!location) return undefined;
    const pickers = parentPickersForLocation(allLocations, location.id);
    return {
      ...emptyLocationForm(),
      name: location.name,
      description: location.description || '',
      isDefault: Boolean(location.isDefault),
      parentRootId: pickers.rootId,
      parentMiddleId: pickers.middleId,
    };
  }, [location, allLocations]);

  if (!canInventoryManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Konum Düzenle', headerShown: false }} />
        <AccessDenied description="Konum düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: LocationFormValues) => {
    if (!token || !location) return;
    setSaving(true);
    try {
      const parentId = resolveParentForNewLocation(values.parentRootId, values.parentMiddleId);
      await locationService.updateLocation(
        location.id,
        {
          name: values.name,
          description: values.description,
          parentId,
          isDefault: values.isDefault,
        },
        token
      );
      router.replace(`/locations/${location.id}`);
    } catch (err: unknown) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Konum güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Konum Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Konum düzenle"
            subtitle={location?.name ?? 'Konum bilgilerini güncelleyin'}
          />
        </View>
        {loading || !location || !initialValues ? (
          <Loading fullScreen label="Konum yükleniyor…" />
        ) : (
          <LocationForm
            mode="edit"
            excludeLocationId={location.id}
            initialValues={initialValues}
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
