import {
  Button,
  Card,
  Checkbox,
  ErrorBanner,
  Input,
  Loading,
  Switch,
  Text,
  TextArea,
} from '@/components/ui';
import {
  buildPermissionSelectionFromRole,
  computeOperationsFromSelection,
  groupCatalogByResource,
  initialEmptySelection,
  mergeSelectionForOperation,
  OPERATION_LABELS,
  selectedPermissionNames,
} from '@/domain/access/operationLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Permission } from '@/services/types/permission.types';
import {
  emptyRoleForm,
  validateRoleForm,
  type RoleFormValues,
} from '@/services/types/role.types';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type RoleFormSubmitPayload = {
  values: RoleFormValues;
  selectedPermissions: string[];
};

export type RoleFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<RoleFormValues>;
  /** Edit: lock isSystemRole if originally system */
  lockSystemRole?: boolean;
  initialPermissionNames?: string[];
  catalog: Permission[];
  catalogLoading?: boolean;
  onSubmit: (payload: RoleFormSubmitPayload) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export function RoleForm({
  mode,
  initialValues,
  lockSystemRole = false,
  initialPermissionNames = [],
  catalog,
  catalogLoading = false,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}: RoleFormProps) {
  const { colors, spacing, radius } = useAppTheme();
  const [values, setValues] = useState<RoleFormValues>(() => ({
    ...emptyRoleForm(),
    ...initialValues,
  }));
  const [permissionSelection, setPermissionSelection] = useState<Record<string, boolean>>({});
  const [operations, setOperations] = useState<Record<string, boolean>>(() =>
    computeOperationsFromSelection({})
  );

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const initialPermKey = initialPermissionNames.slice().sort().join('\0');

  useEffect(() => {
    if (catalogLoading || catalog.length === 0) return;
    const active = catalog.filter((p) => p.isActive !== false);
    const names = initialPermKey ? initialPermKey.split('\0') : [];
    let sel: Record<string, boolean>;
    if (mode === 'edit' || names.length > 0) {
      sel = buildPermissionSelectionFromRole(names, active);
    } else {
      sel = initialEmptySelection(active);
      sel = mergeSelectionForOperation(sel, 'REQUEST_CREATE', true);
      sel = mergeSelectionForOperation(sel, 'REQUEST_VIEW', true);
    }
    setPermissionSelection(sel);
    setOperations(computeOperationsFromSelection(sel));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialPermKey stabilizes array identity
  }, [catalog, catalogLoading, mode, initialPermKey]);

  const setField = <K extends keyof RoleFormValues>(key: K, value: RoleFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const grouped = useMemo(() => groupCatalogByResource(catalog), [catalog]);

  const orphanNames = useMemo(() => {
    const catalogNames = new Set(catalog.map((p) => p.name));
    return Object.keys(permissionSelection)
      .filter((n) => !catalogNames.has(n))
      .sort();
  }, [catalog, permissionSelection]);

  const handleSubmit = async () => {
    const result = validateRoleForm(values);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      values: {
        ...values,
        name: values.name.trim().toUpperCase(),
        displayName: values.displayName.trim(),
        description: values.description.trim(),
      },
      selectedPermissions: selectedPermissionNames(permissionSelection),
    });
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: spacing['3xl'],
        gap: spacing.md,
      }}
    >
      {error ? <ErrorBanner message={error} /> : null}

      <Card>
        <Text variant="h3" style={{ marginBottom: spacing.md }}>
          Temel bilgiler
        </Text>
        <Input
          label="Rol adı"
          required
          placeholder="TEST_ROLE"
          value={values.name}
          onChangeText={(v) => setField('name', v.toUpperCase().replace(/[^A-Z_]/g, ''))}
          autoCapitalize="characters"
          helper="Sadece büyük harfler ve alt çizgi"
        />
        <Input
          label="Görünen ad"
          required
          placeholder="Test Rolü"
          value={values.displayName}
          onChangeText={(v) => setField('displayName', v)}
        />
        <TextArea
          label="Açıklama"
          required
          placeholder="Bu rolün amacını ve kapsamını açıklayın"
          value={values.description}
          onChangeText={(v) => setField('description', v)}
        />
      </Card>

      <Card>
        <Text variant="h3" style={{ marginBottom: spacing.md }}>
          Rol ayarları
        </Text>
        <Switch
          label="Rol aktif"
          helper="Aktif roller kullanıcılara atanabilir"
          value={values.isActive}
          onChange={(v) => setField('isActive', v)}
        />
        <Switch
          label="Sistem rolü"
          helper={
            lockSystemRole
              ? 'Bu rol zaten sistem rolüdür; değiştirilemez'
              : 'Sistem rolleri silinemez'
          }
          value={values.isSystemRole}
          onChange={(v) => setField('isSystemRole', v)}
          disabled={lockSystemRole}
        />
      </Card>

      <Card>
        <Text variant="h3" style={{ marginBottom: spacing.sm }}>
          İşlem yetkileri (özet)
        </Text>
        <Text variant="helper" style={{ marginBottom: spacing.md }}>
          Özet kutular tanımlı grupları işaretler. Ayrıntı için aşağıdaki listeyi kullanın.
        </Text>
        <View style={{ gap: spacing.xs }}>
          {OPERATION_LABELS.map((item) => (
            <Checkbox
              key={item.key}
              checked={!!operations[item.key]}
              label={item.label}
              onChange={(enabled) => {
                setPermissionSelection((prev) => {
                  const next = mergeSelectionForOperation(prev, item.key, enabled);
                  setOperations(computeOperationsFromSelection(next));
                  return next;
                });
              }}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="h3" style={{ marginBottom: spacing.sm }}>
          Tüm permission’lar
        </Text>
        {catalogLoading ? (
          <Loading label="İzinler yükleniyor…" />
        ) : (
          <>
            <Text variant="helper" style={{ marginBottom: spacing.md }}>
              Permissionlar ekranında oluşturduğunuz kayıtlar burada görünür.
            </Text>
            {Array.from(grouped.entries()).map(([resource, perms]) => (
              <View key={resource} style={{ marginBottom: spacing.lg }}>
                <Text
                  variant="caption"
                  color={colors.textMuted}
                  style={{ marginBottom: spacing.sm, letterSpacing: 0.6 }}
                >
                  {resource}
                </Text>
                <View style={{ gap: spacing.sm }}>
                  {perms.map((p) => (
                    <View
                      key={p.name}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.borderLight,
                        borderRadius: radius.md,
                        padding: spacing.sm,
                      }}
                    >
                      <Checkbox
                        checked={!!permissionSelection[p.name]}
                        onChange={(checked) => {
                          setPermissionSelection((prev) => {
                            const next = { ...prev, [p.name]: checked };
                            setOperations(computeOperationsFromSelection(next));
                            return next;
                          });
                        }}
                        label={p.displayName || p.name}
                      />
                      <Text
                        variant="caption"
                        color={colors.textMuted}
                        style={{ marginLeft: 36, marginTop: -4 }}
                      >
                        {p.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            {orphanNames.length > 0 ? (
              <View
                style={{
                  marginTop: spacing.md,
                  paddingTop: spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: colors.warningMuted,
                }}
              >
                <Text
                  variant="caption"
                  color={colors.warning}
                  style={{ marginBottom: spacing.sm }}
                >
                  Rolde var, katalogda yok
                </Text>
                {orphanNames.map((name) => (
                  <Checkbox
                    key={name}
                    checked={!!permissionSelection[name]}
                    label={name}
                    onChange={(checked) => {
                      setPermissionSelection((prev) => {
                        const next = { ...prev, [name]: checked };
                        setOperations(computeOperationsFromSelection(next));
                        return next;
                      });
                    }}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
        <Button
          title="İptal"
          variant="outline"
          onPress={onCancel}
          style={{ flex: 1 }}
          disabled={loading}
        />
        <Button
          title={mode === 'create' ? 'Oluştur' : 'Kaydet'}
          onPress={() => void handleSubmit()}
          style={{ flex: 1 }}
          loading={loading}
          disabled={loading || catalogLoading}
        />
      </View>
    </ScrollView>
  );
}
