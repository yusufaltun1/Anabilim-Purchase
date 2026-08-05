import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  ListItem,
  Loading,
  Screen,
  Section,
  Text,
} from '@/components/ui';
import {
  getSeenPendingApprovalIds,
  markPendingApprovalSeen,
  pruneSeenPendingApprovals,
} from '@/domain/home/dashboardPendingSeen';
import {
  countInProgressRequests,
  countThisMonthRequests,
  countTodayRequests,
  filterInProgressRequests,
  isPurchasingStaff,
  requesterLabel,
  sortByCreatedDesc,
} from '@/domain/home/dashboardStats';
import {
  EMPTY_HOME_COUNTS,
  getAttentionChips,
  getHomeMetrics,
  getPrimaryCta,
  getQuickActions,
  isOpenRequestStatus,
  type HomeCounts,
  type HomeRoute,
} from '@/domain/home/homeConfig';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { purchaseService } from '@/services/api/purchase.service';
import { transferService } from '@/services/api/transfer.service';
import type { PurchaseRequest } from '@/services/types/purchase.types';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

function toneColors(
  tone: 'primary' | 'success' | 'warning' | 'info' | 'error',
  colors: ReturnType<typeof useAppTheme>['colors']
) {
  switch (tone) {
    case 'success':
      return { fg: colors.success, bg: colors.successMuted };
    case 'warning':
      return { fg: colors.warning, bg: colors.warningMuted };
    case 'error':
      return { fg: colors.error, bg: colors.errorMuted };
    case 'primary':
      return { fg: colors.primary, bg: colors.primaryMuted };
    default:
      return { fg: colors.info, bg: colors.infoMuted };
  }
}

function requestSubtitle(request: PurchaseRequest, opts?: { seen?: boolean }): string {
  const parts = [
    requesterLabel(request),
    `${request.items?.length || 0} ürün`,
    new Date(request.createdAt || '').toLocaleDateString('tr-TR'),
  ].filter(Boolean);
  if (opts?.seen) parts.push('Görüntülendi');
  return parts.join(' · ');
}

export default function HomeScreen() {
  const { user, logout, token, isAuthenticated } = useAuth();
  const caps = useCapabilities();
  const { colors, spacing, radius } = useAppTheme();
  const { unreadCount } = useNotifications();

  const purchasingStaff = useMemo(() => isPurchasingStaff(user?.roles), [user?.roles]);

  const [counts, setCounts] = useState<HomeCounts>(EMPTY_HOME_COUNTS);
  const [inProgressList, setInProgressList] = useState<PurchaseRequest[]>([]);
  const [pendingList, setPendingList] = useState<PurchaseRequest[]>([]);
  const [seniorForwardedList, setSeniorForwardedList] = useState<PurchaseRequest[]>([]);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const userName =
    user?.displayName ||
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
    'Kullanıcı';

  const load = useCallback(async () => {
    if (!isAuthenticated || !token || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      const myRequestsPromise = purchaseService.getMyRequests(token);
      const pendingPromise = caps.canApprove
        ? purchaseService.getPendingApprovals(token).catch(() => [] as PurchaseRequest[])
        : Promise.resolve([] as PurchaseRequest[]);
      const forwardedPromise =
        caps.canApprove && purchasingStaff
          ? purchaseService
              .getSeniorForwardedPendingApprovals(token)
              .catch(() => [] as PurchaseRequest[])
          : Promise.resolve([] as PurchaseRequest[]);
      const transferPromise = transferService
        .getAssignedTransferCount(user.id, token)
        .catch(() => 0);

      const [myRequests, pendingApprovals, seniorForwarded, transferCount] = await Promise.all([
        myRequestsPromise,
        pendingPromise,
        forwardedPromise,
        transferPromise,
      ]);

      const seniorForwardedIds = new Set(
        seniorForwarded.map((r) => r.id).filter((id): id is number => id != null)
      );
      const pendingDisplay =
        purchasingStaff
          ? pendingApprovals.filter((r) => r.id != null && !seniorForwardedIds.has(r.id))
          : pendingApprovals;

      const myApproved = myRequests.filter((r) => r.status === 'APPROVED').length;
      const myRejected = myRequests.filter((r) => r.status === 'REJECTED').length;
      const myOpen = myRequests.filter((r) => isOpenRequestStatus(r.status)).length;
      const thisMonth = countThisMonthRequests(myRequests);
      const today = countTodayRequests(myRequests);
      const inProgress = countInProgressRequests(myRequests);

      setCounts({
        myTotal: myRequests.length,
        myOpen,
        myApproved,
        myRejected,
        pendingApprovals: pendingDisplay.length,
        transferCount: transferCount || 0,
        thisMonth,
        today,
        inProgress,
      });

      setInProgressList(filterInProgressRequests(myRequests).slice(0, 5));
      setPendingList(sortByCreatedDesc(pendingDisplay).slice(0, 5));
      setSeniorForwardedList(sortByCreatedDesc(seniorForwarded).slice(0, 8));

      const pendingIds = pendingApprovals
        .map((r) => r.id)
        .filter((id): id is number => id != null);
      const forwardedIds = seniorForwarded
        .map((r) => r.id)
        .filter((id): id is number => id != null);
      await pruneSeenPendingApprovals(user.id, [...new Set([...pendingIds, ...forwardedIds])]);
      const seen = await getSeenPendingApprovalIds(user.id);
      setSeenIds(seen);
    } catch (error) {
      console.error('Home load failed:', error);
      setCounts(EMPTY_HOME_COUNTS);
      setInProgressList([]);
      setPendingList([]);
      setSeniorForwardedList([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, user?.id, caps.canApprove, purchasingStaff]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const navigate = (route: HomeRoute) => {
    router.push(route as never);
  };

  const openPendingItem = async (requestId: number) => {
    if (user?.id) {
      await markPendingApprovalSeen(user.id, requestId);
      setSeenIds((prev) => {
        const next = new Set(prev);
        next.add(requestId);
        return next;
      });
    }
    router.push(`/approval-detail/${requestId}`);
  };

  const openOwnRequest = (requestId: number) => {
    router.push(`/request-detail/${requestId}`);
  };

  const goToPendingList = () => {
    navigate('/(tabs)/pending-approvals');
  };

  const primary = useMemo(() => getPrimaryCta(caps, counts), [caps, counts]);
  const chips = useMemo(() => getAttentionChips(caps, counts), [caps, counts]);
  const metrics = useMemo(() => getHomeMetrics(caps, counts), [caps, counts]);
  const actions = useMemo(() => getQuickActions(caps, counts), [caps, counts]);

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

  if (loading && !refreshing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <Screen>
          <Loading fullScreen label="Yükleniyor…" />
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen scroll={false} padded={false} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing['3xl'],
            paddingTop: spacing.md,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing.lg }]}>
            <View style={{ flex: 1 }}>
              <Text variant="caption">Merhaba</Text>
              <Text variant="h2" numberOfLines={1}>
                {userName}
              </Text>
            </View>
            <View style={{ position: 'relative' }}>
              <IconButton
                name="notifications-outline"
                accessibilityLabel="Bildirimler"
                onPress={() => navigate('/(tabs)/notifications')}
                color={colors.text}
              />
              {unreadCount > 0 ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.notifDot,
                    {
                      backgroundColor: colors.error,
                      top: 8,
                      right: 8,
                    },
                  ]}
                />
              ) : null}
            </View>
            <IconButton
              name="log-out-outline"
              accessibilityLabel="Çıkış yap"
              onPress={() => setLogoutOpen(true)}
              color={colors.textSecondary}
            />
          </View>

          {/* Attention chips */}
          {chips.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: spacing.md }}
              contentContainerStyle={{ gap: spacing.sm }}
            >
              {chips.map((chip) => (
                <Pressable
                  key={chip.key}
                  onPress={() => {
                    if (chip.route === '/(tabs)/pending-approvals') {
                      goToPendingList();
                    } else {
                      navigate(chip.route);
                    }
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.full,
                    backgroundColor: colors.primaryMuted,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Ionicons name="flash" size={14} color={colors.primary} />
                  <Text variant="label" color={colors.primary}>
                    {chip.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {/* Primary CTA */}
          <Card style={{ marginBottom: spacing.lg }} elevated>
            <Text variant="caption" style={{ marginBottom: spacing.sm }}>
              Şimdi yap
            </Text>
            <Button
              title={primary.title}
              onPress={() => {
                if (primary.route === '/(tabs)/pending-approvals') {
                  goToPendingList();
                } else {
                  navigate(primary.route);
                }
              }}
              fullWidth
              leftIcon={<Ionicons name={primary.icon} size={20} color={colors.textInverse} />}
            />
          </Card>

          {/* Dashboard stats — 2×2 */}
          <View style={[styles.metricsGrid, { gap: spacing.sm, marginBottom: spacing.lg }]}>
            {metrics.map((m) => {
              const t = toneColors(m.tone, colors);
              return (
                <Card
                  key={m.key}
                  style={styles.metricCard}
                  padding={spacing.md}
                  elevated={false}
                >
                  <View
                    style={[
                      styles.metricIcon,
                      { backgroundColor: t.bg, marginBottom: spacing.sm },
                    ]}
                  >
                    <Ionicons name={m.icon} size={18} color={t.fg} />
                  </View>
                  <Text variant="h3">{m.value}</Text>
                  <Text variant="caption" numberOfLines={2}>
                    {m.label}
                  </Text>
                </Card>
              );
            })}
          </View>

          {/* Quick actions */}
          <Section title="Hızlı erişim">
            <View style={[styles.actionsGrid, { gap: spacing.sm }]}>
              {actions.map((action) => (
                <Card
                  key={action.key}
                  onPress={() => {
                    if (action.route === '/(tabs)/pending-approvals') {
                      goToPendingList();
                    } else {
                      navigate(action.route);
                    }
                  }}
                  style={{ width: '48.5%', position: 'relative' }}
                  padding={spacing.md}
                >
                  {action.badge ? (
                    <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
                      <Badge label={String(action.badge)} tone="error" />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.actionIcon,
                      {
                        backgroundColor: colors.primaryMuted,
                        marginBottom: spacing.sm,
                      },
                    ]}
                  >
                    <Ionicons name={action.icon} size={22} color={colors.primary} />
                  </View>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {action.title}
                  </Text>
                  <Text variant="caption" numberOfLines={2}>
                    {action.description}
                  </Text>
                </Card>
              ))}
            </View>
          </Section>

          {/* Onaylananlar — satın alma personeli */}
          {caps.canApprove && purchasingStaff ? (
            <Section
              title="Onaylananlar"
              description="Üst onaycıdan size iletilen talepler"
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}
              >
                <Pressable onPress={goToPendingList} hitSlop={8}>
                  <Text variant="label" color={colors.primary}>
                    Tümünü gör
                  </Text>
                </Pressable>
              </View>
              {seniorForwardedList.length === 0 ? (
                <EmptyState
                  title="İletilen talep yok"
                  description="Üst onaycıdan size iletilmiş talep bulunmuyor."
                  icon="checkmark-done-outline"
                />
              ) : (
                <Card padding={spacing.sm}>
                  {seniorForwardedList.map((item, index) => {
                    const isSeen = seenIds.has(item.id);
                    return (
                      <View key={item.id}>
                        <ListItem
                          title={item.title || `Talep #${item.id}`}
                          subtitle={requestSubtitle(item, { seen: isSeen })}
                          left={
                            !isSeen ? (
                              <View
                                style={[styles.unseenDot, { backgroundColor: colors.success }]}
                              />
                            ) : undefined
                          }
                          onPress={() => void openPendingItem(item.id)}
                          right={<Badge label="İletildi" tone="success" />}
                        />
                        {index < seniorForwardedList.length - 1 ? (
                          <View
                            style={{
                              height: StyleSheet.hairlineWidth,
                              backgroundColor: colors.border,
                              marginLeft: spacing.md,
                            }}
                          />
                        ) : null}
                      </View>
                    );
                  })}
                </Card>
              )}
            </Section>
          ) : null}

          {/* İşlemde — kendi talepleri */}
          <Section
            title="İşlemde"
            description="Onaylanmış ve işlemdeki talepleriniz"
          >
            <View
              style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}
            >
              <Pressable onPress={() => navigate('/(tabs)/my-requests')} hitSlop={8}>
                <Text variant="label" color={colors.primary}>
                  Tümünü gör
                </Text>
              </Pressable>
            </View>
            {inProgressList.length === 0 ? (
              <EmptyState
                title="İşlemde talep yok"
                description="Onaylanmış veya işlemde olan talebiniz bulunmuyor."
                icon="flash-outline"
              />
            ) : (
              <Card padding={spacing.sm}>
                {inProgressList.map((item, index) => (
                  <View key={item.id}>
                    <ListItem
                      title={item.title || `Talep #${item.id}`}
                      subtitle={requestSubtitle(item)}
                      onPress={() => openOwnRequest(item.id)}
                      right={<Badge label="İşlemde" tone="info" />}
                    />
                    {index < inProgressList.length - 1 ? (
                      <View
                        style={{
                          height: StyleSheet.hairlineWidth,
                          backgroundColor: colors.border,
                          marginLeft: spacing.md,
                        }}
                      />
                    ) : null}
                  </View>
                ))}
              </Card>
            )}
          </Section>

          {/* Onay bekleyen */}
          {caps.canApprove ? (
            <Section
              title="Onay bekleyen"
              description="Sizin onayınızı bekleyen talepler"
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}
              >
                <Pressable onPress={goToPendingList} hitSlop={8}>
                  <Text variant="label" color={colors.primary}>
                    Tümünü gör
                  </Text>
                </Pressable>
              </View>
              {pendingList.length === 0 ? (
                <EmptyState
                  title="Onay bekleyen yok"
                  description="Şu an onayınızı bekleyen talep bulunmuyor."
                  icon="time-outline"
                />
              ) : (
                <Card padding={spacing.sm}>
                  {pendingList.map((item, index) => {
                    const isSeen = seenIds.has(item.id);
                    const isOwn =
                      user?.id != null && item.requester?.id === user.id;
                    return (
                      <View key={item.id}>
                        <ListItem
                          title={item.title || `Talep #${item.id}`}
                          subtitle={requestSubtitle(item, { seen: isSeen })}
                          left={
                            !isSeen ? (
                              <View
                                style={[styles.unseenDot, { backgroundColor: colors.primary }]}
                              />
                            ) : undefined
                          }
                          onPress={() => void openPendingItem(item.id)}
                          right={
                            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                              <Badge label="Onay Bekliyor" tone="warning" />
                              <Badge
                                label={isOwn ? 'Kendi talebiniz' : 'Size onay'}
                                tone={isOwn ? 'neutral' : 'warning'}
                              />
                            </View>
                          }
                        />
                        {index < pendingList.length - 1 ? (
                          <View
                            style={{
                              height: StyleSheet.hairlineWidth,
                              backgroundColor: colors.border,
                              marginLeft: spacing.md,
                            }}
                          />
                        ) : null}
                      </View>
                    );
                  })}
                </Card>
              )}
            </Section>
          ) : null}
        </ScrollView>

        <ConfirmDialog
          visible={logoutOpen}
          title="Çıkış yap"
          message="Oturumu kapatmak istediğinize emin misiniz?"
          confirmTitle="Çıkış yap"
          cancelTitle="İptal"
          destructive
          loading={loggingOut}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={() => void confirmLogout()}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricCard: {
    width: '48.5%',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unseenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
