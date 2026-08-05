import {
  Badge,
  Card,
  ConfirmDialog,
  EmptyState,
  ListItem,
  Screen,
  Section,
  Text,
} from '@/components/ui';
import { EMPTY_HOME_COUNTS, getMoreMenuItems, type HomeCounts, type HomeRoute } from '@/domain/home/homeConfig';
import { isPurchasingStaff } from '@/domain/home/dashboardStats';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseService } from '@/services/api/purchase.service';
import { transferService } from '@/services/api/transfer.service';
import type { PurchaseRequest } from '@/services/types/purchase.types';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';

export default function MoreScreen() {
  const { user, logout, token, isAuthenticated } = useAuth();
  const caps = useCapabilities();
  const { colors, spacing } = useAppTheme();

  const purchasingStaff = useMemo(() => isPurchasingStaff(user?.roles), [user?.roles]);

  const [counts, setCounts] = useState<HomeCounts>(EMPTY_HOME_COUNTS);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated || !token || !user?.id) return;
    try {
      const pendingPromise = caps.canApprove
        ? purchaseService.getPendingApprovals(token).catch(() => [] as PurchaseRequest[])
        : Promise.resolve([] as PurchaseRequest[]);
      const forwardedPromise =
        caps.canApprove && purchasingStaff
          ? purchaseService
              .getSeniorForwardedPendingApprovals(token)
              .catch(() => [] as PurchaseRequest[])
          : Promise.resolve([] as PurchaseRequest[]);
      const [pending, seniorForwarded, transferCount] = await Promise.all([
        pendingPromise,
        forwardedPromise,
        transferService.getAssignedTransferCount(user.id, token).catch(() => 0),
      ]);
      const seniorIds = new Set(
        seniorForwarded.map((r) => r.id).filter((id): id is number => id != null)
      );
      const pendingDisplay = purchasingStaff
        ? pending.filter((r) => r.id != null && !seniorIds.has(r.id))
        : pending;
      setCounts((prev) => ({
        ...prev,
        pendingApprovals: pendingDisplay.length,
        transferCount: transferCount || 0,
      }));
    } catch {
      // ignore
    }
  }, [isAuthenticated, token, user?.id, caps.canApprove, purchasingStaff]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(
    () => getMoreMenuItems(caps, counts, { includeDev: __DEV__ }),
    [caps, counts]
  );

  const navigate = (route: HomeRoute) => {
    router.push(route as never);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setLogoutOpen(false);
      router.replace('/login');
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Daha fazla', headerShown: true }} />
      <Screen
        scroll
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.primary}
          />
        }
      >
        <Section title="Menü" description="Yetkinize göre görünen işlemler">
          {items.length === 0 ? (
            <EmptyState title="Menü boş" description="Görüntülenecek işlem bulunamadı." />
          ) : (
            <Card padding={spacing.sm}>
              {items.map((item, index) => (
                <View key={item.key}>
                  <ListItem
                    title={item.title}
                    subtitle={item.subtitle}
                    onPress={() => navigate(item.route)}
                    left={
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: colors.primaryMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name={item.icon} size={20} color={colors.primary} />
                      </View>
                    }
                    right={
                      item.badge ? <Badge label={String(item.badge)} tone="error" /> : undefined
                    }
                  />
                  {index < items.length - 1 ? (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.border,
                        marginLeft: 56,
                      }}
                    />
                  ) : null}
                </View>
              ))}
            </Card>
          )}
        </Section>

        <Section title="Hesap">
          <Card padding={spacing.sm}>
            {user?.email ? (
              <ListItem title="E-posta" subtitle={user.email} showChevron={false} />
            ) : null}
            {user?.department ? (
              <ListItem title="Departman" subtitle={user.department} showChevron={false} />
            ) : null}
            <ListItem
              title="Çıkış yap"
              onPress={() => setLogoutOpen(true)}
              left={<Ionicons name="log-out-outline" size={22} color={colors.error} />}
              showChevron={false}
            />
          </Card>
        </Section>

        <ConfirmDialog
          visible={logoutOpen}
          title="Çıkış yap"
          message="Oturumu kapatmak istediğinize emin misiniz?"
          confirmTitle="Çıkış yap"
          destructive
          loading={loggingOut}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={() => void confirmLogout()}
        />
      </Screen>
    </>
  );
}
