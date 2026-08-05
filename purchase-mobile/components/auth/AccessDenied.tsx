import { EmptyState, Screen } from '@/components/ui';
import { router } from 'expo-router';
import React from 'react';

export type AccessDeniedProps = {
  title?: string;
  description?: string;
};

export function AccessDenied({
  title = 'Yetkiniz yok',
  description = 'Bu ekranı görüntüleme yetkiniz bulunmuyor.',
}: AccessDeniedProps) {
  return (
    <Screen>
      <EmptyState
        title={title}
        description={description}
        icon="lock-closed-outline"
        actionTitle="Ana sayfaya dön"
        onAction={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}
