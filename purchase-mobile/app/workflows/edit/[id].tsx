import { AccessDenied } from '@/components/auth/AccessDenied';
import {
  WorkflowForm,
  type WorkflowFormSubmitPayload,
} from '@/components/workflows';
import { Button, ErrorBanner, Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { workflowService } from '@/services/api/workflow.service';
import {
  editRoleSelectOptions,
  type ApprovalWorkflow,
  type WorkflowFormValues,
  type WorkflowStep,
} from '@/services/types/workflow.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

export default function WorkflowEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workflowId = Number(id);
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [initialValues, setInitialValues] = useState<WorkflowFormValues | null>(null);
  const [initialSteps, setInitialSteps] = useState<WorkflowStep[]>([]);

  const roleOptions = useMemo(() => editRoleSelectOptions(), []);

  const load = useCallback(async () => {
    if (!token || !canSystemManage || !Number.isFinite(workflowId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await workflowService.getWorkflowById(workflowId, token);
      setWorkflow(data);
      setInitialValues({
        name: data.name,
        description: data.description,
        minAmount: String(data.minAmount),
        maxAmount: String(data.maxAmount),
        category: data.category,
        isActive: data.isActive ?? true,
      });
      setInitialSteps((data.steps ?? []).map((step) => ({ ...step })));
    } catch (err) {
      console.error('Workflow yüklenemedi', err);
      setError('Workflow yüklenirken bir hata oluştu');
      setWorkflow(null);
    } finally {
      setLoading(false);
    }
  }, [token, canSystemManage, workflowId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Workflow Düzenle', headerShown: false }} />
        <AccessDenied description="İş akışı düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async ({ values, steps }: WorkflowFormSubmitPayload) => {
    if (!token || !Number.isFinite(workflowId)) return;
    setSaving(true);
    setError(null);
    try {
      await workflowService.updateWorkflow(
        workflowId,
        {
          id: workflowId,
          name: values.name,
          description: values.description,
          minAmount: parseFloat(values.minAmount.replace(',', '.')),
          maxAmount: parseFloat(values.maxAmount.replace(',', '.')),
          category: values.category,
          isActive: values.isActive,
          steps,
        },
        token
      );
      router.replace('/workflows' as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Workflow güncellenemedi';
      setError(message);
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Workflow Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Workflow düzenle"
            subtitle={workflow?.name ? `"${workflow.name}"` : 'Workflow bilgilerini güncelleyin'}
          />
        </View>
        {loading ? (
          <Loading fullScreen label="Workflow yükleniyor…" />
        ) : !workflow || !initialValues ? (
          <View style={{ padding: 16, gap: 12 }}>
            <ErrorBanner message={error ?? 'Workflow bulunamadı'} />
            <Button
              title="← Workflow listesine dön"
              variant="outline"
              onPress={() => router.replace('/workflows' as never)}
            />
          </View>
        ) : (
          <WorkflowForm
            mode="edit"
            initialValues={initialValues}
            initialSteps={initialSteps}
            roleOptions={roleOptions}
            loading={saving}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
