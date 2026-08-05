import {
  Button,
  Card,
  Checkbox,
  ErrorBanner,
  IconButton,
  Input,
  Select,
  Switch,
  Text,
  TextArea,
  type SelectOption,
} from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  APPROVAL_TYPE_OPTIONS,
  categorySelectOptions,
  emptyWorkflowForm,
  emptyWorkflowStep,
  validateWorkflowForm,
  type ApproverType,
  type ApprovalType,
  type WorkflowFormValues,
  type WorkflowStep,
} from '@/services/types/workflow.types';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type WorkflowFormSubmitPayload = {
  values: WorkflowFormValues;
  steps: WorkflowStep[];
};

export type WorkflowFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<WorkflowFormValues>;
  initialSteps?: WorkflowStep[];
  /** Create: API aktif roller; Edit: sabit dizi */
  roleOptions: SelectOption<string>[];
  rolesLoading?: boolean;
  onSubmit: (payload: WorkflowFormSubmitPayload) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export function WorkflowForm({
  mode,
  initialValues,
  initialSteps,
  roleOptions,
  rolesLoading = false,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}: WorkflowFormProps) {
  const { colors, spacing, radius } = useAppTheme();
  const [values, setValues] = useState<WorkflowFormValues>(() => ({
    ...emptyWorkflowForm(),
    ...initialValues,
  }));
  const [steps, setSteps] = useState<WorkflowStep[]>(() =>
    initialSteps && initialSteps.length > 0
      ? initialSteps.map((s) => ({ ...s }))
      : [emptyWorkflowStep(1, mode === 'create' ? 'ROLE' : 'USER')]
  );

  const newStepApproverType: ApproverType = mode === 'create' ? 'ROLE' : 'USER';
  const showStepName = mode === 'create';
  const showIsActive = mode === 'edit';

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  useEffect(() => {
    if (initialSteps && initialSteps.length > 0) {
      setSteps(initialSteps.map((s) => ({ ...s })));
    }
  }, [initialSteps]);

  const setField = <K extends keyof WorkflowFormValues>(key: K, value: WorkflowFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateStep = <K extends keyof WorkflowStep>(
    index: number,
    field: K,
    value: WorkflowStep[K]
  ) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addStep = () => {
    setSteps((prev) => [...prev, emptyWorkflowStep(prev.length + 1, newStepApproverType)]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, stepOrder: i + 1 }))
    );
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }
    setSteps((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((step, i) => ({ ...step, stepOrder: i + 1 }));
    });
  };

  const handleCancel = () => {
    const dirtyCreate =
      mode === 'create' &&
      (!!values.name || !!values.description || steps.some((s) => s.roleName));
    const dirtyEdit =
      mode === 'edit' &&
      initialValues &&
      (values.name !== (initialValues.name ?? '') ||
        values.description !== (initialValues.description ?? '') ||
        values.minAmount !== (initialValues.minAmount ?? '') ||
        values.maxAmount !== (initialValues.maxAmount ?? '') ||
        values.category !== (initialValues.category ?? '') ||
        values.isActive !== (initialValues.isActive ?? true) ||
        JSON.stringify(steps) !== JSON.stringify(initialSteps ?? []));

    if (dirtyCreate || dirtyEdit) {
      Alert.alert(
        'İptal',
        'Değişiklikleriniz kaydedilmeyecek. Devam etmek istiyor musunuz?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Evet', style: 'destructive', onPress: onCancel },
        ]
      );
      return;
    }
    onCancel();
  };

  const handleSubmit = async () => {
    const result = validateWorkflowForm(values, steps, {
      requireStepName: mode === 'create',
    });
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      values: {
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
      },
      steps: steps.map((step) => ({
        ...step,
        roleName: step.roleName.trim(),
        stepName: step.stepName.trim(),
      })),
    });
  };

  const categoryOptions = categorySelectOptions();
  const approvalOptions = APPROVAL_TYPE_OPTIONS.map((t) => ({
    label: t.label,
    value: t.value,
  }));

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
          label="Workflow adı"
          required
          placeholder="Örn: IT Ekipman Satınalma"
          value={values.name}
          onChangeText={(v) => setField('name', v)}
        />
        <Select
          label="Kategori"
          required
          placeholder="Kategori seçin"
          options={categoryOptions}
          value={values.category || null}
          onChange={(v) => setField('category', v ?? '')}
          clearable={false}
        />
        <TextArea
          label="Açıklama"
          required
          placeholder="Bu workflow'un amacını ve kapsamını açıklayın"
          value={values.description}
          onChangeText={(v) => setField('description', v)}
        />
        <Input
          label="Minimum tutar (₺)"
          required
          placeholder="0"
          value={values.minAmount}
          onChangeText={(v) => setField('minAmount', v.replace(/[^0-9.,]/g, ''))}
          keyboardType="decimal-pad"
        />
        <Input
          label="Maksimum tutar (₺)"
          required
          placeholder="10000"
          value={values.maxAmount}
          onChangeText={(v) => setField('maxAmount', v.replace(/[^0-9.,]/g, ''))}
          keyboardType="decimal-pad"
        />
        {showIsActive ? (
          <Switch
            label="Workflow aktif"
            helper="Bu seçenek işaretliyse workflow kullanılabilir durumda olacaktır"
            value={values.isActive}
            onChange={(v) => setField('isActive', v)}
          />
        ) : null}
      </Card>

      <Card>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
            gap: spacing.sm,
          }}
        >
          <Text variant="h3" style={{ flex: 1 }}>
            Onay adımları
          </Text>
          <Button title="Adım ekle" onPress={addStep} variant="secondary" size="small" />
        </View>

        <View style={{ gap: spacing.md }}>
          {steps.map((step, index) => (
            <View
              key={`step-${index}-${step.stepOrder}`}
              style={{
                borderWidth: 1,
                borderColor: colors.borderLight,
                borderRadius: radius.md,
                padding: spacing.md,
                backgroundColor: colors.backgroundSecondary,
                gap: spacing.sm,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text variant="bodyStrong">Adım {step.stepOrder}</Text>
                {steps.length > 1 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton
                      name="chevron-up"
                      onPress={() => moveStep(index, 'up')}
                      disabled={index === 0}
                      accessibilityLabel="Adımı yukarı taşı"
                    />
                    <IconButton
                      name="chevron-down"
                      onPress={() => moveStep(index, 'down')}
                      disabled={index === steps.length - 1}
                      accessibilityLabel="Adımı aşağı taşı"
                    />
                    <IconButton
                      name="trash-outline"
                      onPress={() => removeStep(index)}
                      color={colors.error}
                      accessibilityLabel="Adımı sil"
                    />
                  </View>
                ) : null}
              </View>

              {showStepName ? (
                <Input
                  label="Adım adı"
                  required
                  placeholder="Örn: Departman Müdürü Onayı"
                  value={step.stepName}
                  onChangeText={(v) => updateStep(index, 'stepName', v)}
                  containerStyle={{ marginBottom: 0 }}
                />
              ) : null}

              <Select
                label="Rol"
                required
                placeholder={rolesLoading ? 'Roller yükleniyor…' : 'Rol seçin'}
                options={roleOptions}
                value={step.roleName || null}
                onChange={(v) => updateStep(index, 'roleName', v ?? '')}
                clearable={false}
                disabled={rolesLoading || loading}
                containerStyle={{ marginBottom: 0 }}
              />

              <Select
                label="Onay tipi"
                options={approvalOptions}
                value={step.approvalType}
                onChange={(v) =>
                  updateStep(index, 'approvalType', (v as ApprovalType) ?? 'APPROVE')
                }
                clearable={false}
                searchable={false}
                containerStyle={{ marginBottom: 0 }}
              />

              <Checkbox
                checked={step.isRequired}
                label="Zorunlu"
                onChange={(checked) => updateStep(index, 'isRequired', checked)}
              />
            </View>
          ))}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
        <Button
          title="İptal"
          variant="outline"
          onPress={handleCancel}
          style={{ flex: 1 }}
          disabled={loading}
        />
        <Button
          title={mode === 'create' ? 'Oluştur' : 'Kaydet'}
          onPress={() => void handleSubmit()}
          style={{ flex: 1 }}
          loading={loading}
          disabled={loading || rolesLoading}
        />
      </View>
    </ScrollView>
  );
}
