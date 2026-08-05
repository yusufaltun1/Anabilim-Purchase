import { AccessDenied } from '@/components/auth/AccessDenied';
import { WorkflowList } from '@/components/workflows';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function WorkflowsScreen() {
  const router = useRouter();
  const { canSystemManage } = useCapabilities();

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'İş Akışları', headerShown: false }} />
        <AccessDenied description="İş akışı yönetimi için yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'İş Akışları', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Onay süreçleri"
            subtitle="Sistemdeki tüm onay süreçlerini yönetin"
            right={
              <IconButton
                name="add"
                onPress={() => router.push('/workflows/create' as never)}
                accessibilityLabel="Yeni workflow"
              />
            }
          />
        </View>
        <WorkflowList
          onCreate={() => router.push('/workflows/create' as never)}
          onEdit={(workflow) => {
            if (workflow.id != null) {
              router.push(`/workflows/edit/${workflow.id}` as never);
            }
          }}
          onPress={(workflow) => {
            if (workflow.id != null) {
              router.push(`/workflows/edit/${workflow.id}` as never);
            }
          }}
        />
      </Screen>
    </>
  );
}
