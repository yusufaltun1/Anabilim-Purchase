import { AccessDenied } from '@/components/auth/AccessDenied';
import { Loading, Screen, ScreenHeader, type SelectOption } from '@/components/ui';
import {
  WorkflowForm,
  type WorkflowFormSubmitPayload,
} from '@/components/workflows';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { roleService } from '@/services/api/role.service';
import { workflowService } from '@/services/api/workflow.service';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function WorkflowCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleOptions, setRoleOptions] = useState<SelectOption<string>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !canSystemManage) {
      setRolesLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const roles = await roleService.getActiveRoles(token);
        if (!cancelled) {
          setRoleOptions(
            roles.map((role) => ({
              label: role.displayName || role.name,
              value: role.name,
            }))
          );
        }
      } catch (err) {
        console.error('Roller yüklenemedi', err);
        if (!cancelled) {
          setError('Roller yüklenirken bir hata oluştu');
        }
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, canSystemManage]);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Workflow', headerShown: false }} />
        <AccessDenied description="İş akışı oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async ({ values, steps }: WorkflowFormSubmitPayload) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await workflowService.createWorkflow(
        {
          name: values.name,
          description: values.description,
          minAmount: parseFloat(values.minAmount.replace(',', '.')),
          maxAmount: parseFloat(values.maxAmount.replace(',', '.')),
          category: values.category,
          steps,
          // isActive create'te gönderilmez (backend varsayılanı)
        },
        token
      );
      router.replace('/workflows' as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Workflow oluşturulamadı';
      setError(message);
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Workflow', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Yeni onay süreci"
            subtitle="Yeni bir onay süreci oluşturun ve adımlarını tanımlayın"
          />
        </View>
        {rolesLoading && roleOptions.length === 0 ? (
          <Loading fullScreen label="Roller yükleniyor…" />
        ) : (
          <WorkflowForm
            mode="create"
            roleOptions={roleOptions}
            rolesLoading={rolesLoading}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
