import {
  Button,
  Card,
  Checkbox,
  Input,
  LocationHierarchyPickers,
  Text,
  TextArea,
  type LocationHierarchyValue,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { locationService } from '@/services/api/location.service';
import {
  LOCATION_LEVEL_LABELS,
  emptyLocationForm,
  newLocationLevel,
  resolveParentForNewLocation,
  validateLocationForm,
  type Location,
  type LocationFormValues,
} from '@/services/types/location.types';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type LocationFormProps = {
  mode: 'create' | 'edit';
  /** Düzenlemede kendisini üst seçiminden hariç tutmak için */
  excludeLocationId?: number;
  initialValues?: Partial<LocationFormValues>;
  onSubmit: (values: LocationFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function LocationForm({
  mode,
  excludeLocationId,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: LocationFormProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [values, setValues] = useState<LocationFormValues>(() => ({
    ...emptyLocationForm(),
    ...initialValues,
  }));
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  useEffect(() => {
    if (!token) {
      setLocationsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLocationsLoading(true);
        const list = await locationService.getAllLocations(token);
        if (!cancelled) setAllLocations(list);
      } catch (err) {
        console.error('Locations load failed:', err);
        if (!cancelled) {
          Alert.alert('Hata', 'Konumlar yüklenirken bir sorun oluştu');
        }
      } finally {
        if (!cancelled) setLocationsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const setField = <K extends keyof LocationFormValues>(key: K, value: LocationFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const hierarchyValue: LocationHierarchyValue = useMemo(
    () => ({
      level1Id: values.parentRootId,
      level2Id: values.parentMiddleId,
      level3Id: null,
    }),
    [values.parentRootId, values.parentMiddleId]
  );

  const parentId = resolveParentForNewLocation(values.parentRootId, values.parentMiddleId);
  const targetLevel = useMemo(
    () => newLocationLevel(parentId, allLocations),
    [parentId, allLocations]
  );

  const handleHierarchyChange = (next: LocationHierarchyValue) => {
    setValues((prev) => ({
      ...prev,
      parentRootId: next.level1Id == null ? null : Number(next.level1Id),
      parentMiddleId: next.level2Id == null ? null : Number(next.level2Id),
    }));
  };

  const handleSubmit = async () => {
    const result = validateLocationForm(values, allLocations);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
    >
      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.xs }}>
          Üst konum seçimi
        </Text>
        <Text variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.md }}>
          {mode === 'create'
            ? 'Boş bırakırsanız üst konum oluşturulur. Alt seçerseniz 2., ikisini de seçerseniz 3. seviye oluşur.'
            : 'Bu konumun bağlı olduğu üst hiyerarşiyi seçin.'}
        </Text>
        <LocationHierarchyPickers
          value={hierarchyValue}
          onChange={handleHierarchyChange}
          showLeaf={false}
          excludeIds={excludeLocationId != null ? [excludeLocationId] : []}
          autoSelectDefaults={false}
          disabled={loading || locationsLoading}
          labels={{ level1: 'Üst konum (üst)', level2: 'Alt konum (orta)' }}
        />
        <View
          style={{
            marginTop: spacing.sm,
            padding: spacing.md,
            borderRadius: 8,
            backgroundColor: colors.backgroundMuted,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text variant="caption" color={colors.textMuted}>
            {mode === 'create' ? 'Oluşturulacak seviye' : 'Seviye'}
          </Text>
          <Text variant="bodyStrong" style={{ marginTop: spacing.xxs }}>
            {LOCATION_LEVEL_LABELS[targetLevel] ?? `${targetLevel}. seviye`}
          </Text>
        </View>
      </Card>

      <Card>
        <Input
          label="Konum adı"
          required
          placeholder="Örn. Kampüs A / Bina 1 / Oda 101"
          value={values.name}
          onChangeText={(v) => setField('name', v)}
          autoCapitalize="words"
        />
        <TextArea
          label="Açıklama"
          placeholder="İsteğe bağlı açıklama"
          value={values.description}
          onChangeText={(v) => setField('description', v)}
          numberOfLines={3}
        />
        <Checkbox
          label="Bu seviyede varsayılan konum"
          checked={values.isDefault}
          onChange={(checked) => setField('isDefault', checked)}
        />
        <Text variant="caption" color={colors.textMuted} style={{ marginTop: -spacing.sm }}>
          İşaretlenirse aynı üst konum altındaki diğer varsayılanlar kaldırılır.
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
        <Button
          title="İptal"
          variant="outline"
          style={{ flex: 1 }}
          onPress={onCancel}
          disabled={loading}
        />
        <Button
          title={loading ? 'Kaydediliyor…' : mode === 'create' ? 'Kaydet' : 'Güncelle'}
          style={{ flex: 1 }}
          onPress={() => void handleSubmit()}
          loading={loading}
          disabled={loading || locationsLoading}
        />
      </View>
    </ScrollView>
  );
}
