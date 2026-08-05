import { AccessDenied } from '@/components/auth/AccessDenied';
import { TransferList } from '@/components/transfers';
import {
  IconButton,
  Screen,
  ScreenHeader,
  SegmentedControl,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useAppTheme } from '@/hooks/useAppTheme';
import { transferService } from '@/services/api/transfer.service';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

type TabKey = 'assigned' | 'manage';

export default function TransfersIndexScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const { canSystemManage, canSeeTransfers } = useCapabilities();
  const { spacing } = useAppTheme();
  const [assignedCount, setAssignedCount] = useState(0);
  const [tab, setTab] = useState<TabKey>(canSystemManage ? 'manage' : 'assigned');

  useEffect(() => {
    if (!user?.id || !token) return;
    void transferService
      .getAssignedTransferCount(user.id, token)
      .then(setAssignedCount)
      .catch(() => setAssignedCount(0));
  }, [user?.id, token]);

  const canAccess = canSeeTransfers(assignedCount) || canSystemManage;

  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ title: 'Transferler', headerShown: false }} />
        <AccessDenied description="Transferleri görüntülemek için giriş yapmalısınız." />
      </>
    );
  }

  if (!canAccess) {
    return (
      <>
        <Stack.Screen options={{ title: 'Transferler', headerShown: false }} />
        <AccessDenied description="Transfer listesini görüntüleme yetkiniz yok." />
      </>
    );
  }

  const showManage = canSystemManage;
  const activeTab: TabKey = showManage ? tab : 'assigned';

  return (
    <>
      <Stack.Screen options={{ title: 'Transferler', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Transferler"
            subtitle={
              showManage
                ? 'Atanan ve yönetilen transferler'
                : 'Size atanmış transferler'
            }
            right={
              showManage ? (
                <IconButton
                  name="add"
                  onPress={() => router.push('/transfers/create' as never)}
                  accessibilityLabel="Yeni transfer"
                />
              ) : undefined
            }
          />
          {showManage ? (
            <SegmentedControl
              options={[
                { key: 'assigned', label: 'Bana atanan', icon: 'person-outline' },
                { key: 'manage', label: 'Tümü', icon: 'list-outline' },
              ]}
              value={activeTab}
              onChange={(key) => setTab(key as TabKey)}
              style={{ marginBottom: spacing.sm }}
            />
          ) : null}
        </View>
        <TransferList
          mode={activeTab}
          onNav={(id) => router.push(`/transfers/${id}` as never)}
        />
      </Screen>
    </>
  );
}
