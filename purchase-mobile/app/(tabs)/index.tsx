import { Alert, SafeAreaView, ScrollView, StyleSheet, View, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { purchaseService } from '@/services/api/purchase.service';
import { PurchaseRequest } from '@/services/types/purchase.types';
import { transferService } from '@/services/api/transfer.service';

export default function HomeScreen() {
  const { user, logout, token, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [transferCount, setTransferCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu');
            }
          },
        },
      ]
    );
  };

  // Rol bazlı buton işlevleri
  const handleCreateRequest = () => {
    router.push('/create-request');
  };

  const handleProductSearch = () => {
    router.push('/product-search');
  };

  const handleCreateProduct = () => {
    router.push('/create-product');
  };

  const handleApproveRequests = () => {
    router.push('/(tabs)/pending-approvals');
  };

  const handleMyRequests = () => {
    router.push('/(tabs)/my-requests');
  };

  const handleTransfers = () => {
    router.push('/transfers');
  };

  const loadStats = async () => {
    if (!isAuthenticated || !token || !user || !user.id) {
      console.log('loadStats: Missing requirements', { 
        isAuthenticated, 
        hasToken: !!token, 
        hasUser: !!user,
        userId: user?.id 
      });
      return;
    }

    try {
      console.log('loadStats: Loading transfer count for user:', user.id);
      const [myRequests, pendingApprovals, count] = await Promise.all([
        purchaseService.getMyRequests(token),
        purchaseService.getPendingApprovals(token),
        transferService.getAssignedTransferCount(user.id, token).catch((err) => {
          console.error('Transfer count error:', err);
          return 0;
        }),
      ]);

      console.log('loadStats: Transfer count loaded:', count);
      setTransferCount(count || 0);
      const approved = myRequests.filter(request => request.status === 'APPROVED').length;
      const rejected = myRequests.filter(request => request.status === 'REJECTED').length;
      setStats({
        total: myRequests.length,
        approved,
        rejected,
        pending: pendingApprovals.length,
      });
    } catch (error) {
      console.error('Failed to load home stats:', error);
      setStats({ total: 0, approved: 0, pending: 0, rejected: 0 });
      setTransferCount(0);
    }
  };

  useEffect(() => {
    loadStats();
  }, [isAuthenticated, token, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const userName = user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Kullanıcı';

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: colors.primary + '15' }]}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <View style={[styles.heroIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="person-circle" size={32} color={colors.primary} />
              </View>
              <View style={styles.heroTextContainer}>
                <ThemedText style={styles.heroGreeting}>Hoş Geldiniz</ThemedText>
                <ThemedText style={styles.heroName} numberOfLines={1}>
                  {userName}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutIconButton, { backgroundColor: colors.background }]}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
              <Ionicons name="document-text" size={24} color="#3B82F6" />
            </View>
            <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Toplam Talep
            </ThemedText>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#10B981' + '20' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <ThemedText style={styles.statValue}>{stats.approved}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Onaylanan
            </ThemedText>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
              <Ionicons name="time" size={24} color="#F59E0B" />
            </View>
            <ThemedText style={styles.statValue}>{stats.pending}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Bekleyen
            </ThemedText>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Hızlı İşlemler</ThemedText>
          </View>

          <View style={styles.actionsGrid}>
            <Card
              style={[styles.actionCard, { backgroundColor: colors.background }]}
              onPress={handleCreateRequest}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="add-circle" size={28} color={colors.primary} />
              </View>
              <ThemedText style={styles.actionTitle}>Yeni Talep</ThemedText>
              <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Satın alma talebi oluşturun
              </ThemedText>
            </Card>

            <Card
              style={[styles.actionCard, { backgroundColor: colors.background }]}
              onPress={handleApproveRequests}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              </View>
              <ThemedText style={styles.actionTitle}>Onay Bekleyenler</ThemedText>
              <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Sizden onay bekleyen talepler
              </ThemedText>
              {stats.pending > 0 && (
                <View style={styles.actionBadge}>
                  <ThemedText style={styles.actionBadgeText}>{stats.pending}</ThemedText>
                </View>
              )}
            </Card>

            <Card
              style={[styles.actionCard, { backgroundColor: colors.background }]}
              onPress={handleMyRequests}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                <Ionicons name="document-text" size={28} color="#3B82F6" />
              </View>
              <ThemedText style={styles.actionTitle}>Taleplerim</ThemedText>
              <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Taleplerinizi görüntüleyin
              </ThemedText>
            </Card>

            <Card
              style={[styles.actionCard, { backgroundColor: colors.background }]}
              onPress={handleProductSearch}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
                <Ionicons name="search" size={28} color="#F59E0B" />
              </View>
              <ThemedText style={styles.actionTitle}>Ürün Arama</ThemedText>
              <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Ürün adı veya kodu ile arama
              </ThemedText>
            </Card>

            <Card
              style={[styles.actionCard, { backgroundColor: colors.background }]}
              onPress={handleCreateProduct}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
                <Ionicons name="cube" size={28} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.actionTitle}>Ürün Oluştur</ThemedText>
              <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Yeni ürün ekleyin
              </ThemedText>
            </Card>

            <Card
              style={[styles.actionCard, { backgroundColor: colors.background }]}
              onPress={handleTransfers}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#EC4899' + '20' }]}>
                <Ionicons name="swap-horizontal" size={28} color="#EC4899" />
              </View>
              <ThemedText style={styles.actionTitle}>Transferler</ThemedText>
              <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Teslim alınacak transferler
              </ThemedText>
              {transferCount > 0 && (
                <View style={styles.actionBadge}>
                  <ThemedText style={styles.actionBadgeText}>{transferCount}</ThemedText>
                </View>
              )}
            </Card>
          </View>
        </View>

        {/* User Info Card */}
        {user && (
          <Card style={[styles.userCard, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Kullanıcı Bilgileri</ThemedText>
            </View>

            <View style={styles.userInfoGrid}>
              {user.email && (
                <View style={styles.userInfoRow}>
                  <Ionicons name="mail" size={16} color={colors.textSecondary} />
                  <ThemedText style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
                    E-posta:
                  </ThemedText>
                  <ThemedText style={styles.userInfoValue} numberOfLines={1}>
                    {user.email}
                  </ThemedText>
                </View>
              )}

              {user.department && (
                <View style={styles.userInfoRow}>
                  <Ionicons name="business" size={16} color={colors.textSecondary} />
                  <ThemedText style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
                    Departman:
                  </ThemedText>
                  <ThemedText style={styles.userInfoValue}>{user.department}</ThemedText>
                </View>
              )}

              {user.position && (
                <View style={styles.userInfoRow}>
                  <Ionicons name="briefcase" size={16} color={colors.textSecondary} />
                  <ThemedText style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
                    Pozisyon:
                  </ThemedText>
                  <ThemedText style={styles.userInfoValue}>{user.position}</ThemedText>
                </View>
              )}

              {user.roles && user.roles.length > 0 && (
                <View style={styles.userInfoRow}>
                  <Ionicons name="people" size={16} color={colors.textSecondary} />
                  <ThemedText style={[styles.userInfoLabel, { color: colors.textSecondary }]}>
                    Roller:
                  </ThemedText>
                  <View style={styles.rolesContainer}>
                    {user.roles.map((role, index) => (
                      <View key={index} style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
                        <ThemedText style={[styles.roleText, { color: colors.primary }]}>{role}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingTop: 16,
  },
  // Hero Section
  heroSection: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    marginTop: 8,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.8,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
  },
  logoutIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Actions Section
  actionsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47.5%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  // User Card
  userCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfoGrid: {
    gap: 12,
    marginTop: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userInfoLabel: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 80,
  },
  userInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
