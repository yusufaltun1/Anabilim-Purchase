import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { productService } from '@/services/api/product.service';
import { Assignment, AssignmentStatus, ProductStockDetail } from '@/services/types/product.types';

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return '—';
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) {
    return '—';
  }
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: AssignmentStatus) => {
  switch (status) {
    case AssignmentStatus.ACTIVE:
      return '#10B981'; // green
    case AssignmentStatus.RETURNED:
      return '#6B7280'; // gray
    case AssignmentStatus.EXPIRED:
      return '#F59E0B'; // amber
    case AssignmentStatus.LOST:
      return '#EF4444'; // red
    case AssignmentStatus.DAMAGED:
      return '#DC2626'; // red
    case AssignmentStatus.TRANSFERRED:
      return '#3B82F6'; // blue
    default:
      return '#6B7280';
  }
};

const getStatusLabel = (status: AssignmentStatus) => {
  switch (status) {
    case AssignmentStatus.ACTIVE:
      return 'Aktif';
    case AssignmentStatus.RETURNED:
      return 'İade Edildi';
    case AssignmentStatus.EXPIRED:
      return 'Süresi Doldu';
    case AssignmentStatus.LOST:
      return 'Kayıp';
    case AssignmentStatus.DAMAGED:
      return 'Hasarlı';
    case AssignmentStatus.TRANSFERRED:
      return 'Transfer Edildi';
    default:
      return status;
  }
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const [detail, setDetail] = useState<ProductStockDetail | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDetail = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const data = await productService.getProductStockDetail(Number(id), token);
      setDetail(data);
    } catch (error) {
      console.error('Product detail fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    if (!token || !id) return;
    setAssignmentsLoading(true);
    try {
      const data = await productService.getAssignmentsByProduct(Number(id), token);
      setAssignments(data);
    } catch (error) {
      console.error('Assignments fetch failed:', error);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    loadAssignments();
  }, [id, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDetail(), loadAssignments()]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!detail) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Ürün bulunamadı.</ThemedText>
      </ThemedView>
    );
  }

  const activeAssignments = assignments.filter((a) => a.status === AssignmentStatus.ACTIVE && a.isActive);
  const hasLowStock = detail.warehouseStocks.some((ws) => ws.isLowStock);

  return (
    <>
      <Stack.Screen options={{ title: detail.product.name || 'Ürün Detayı' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: colors.primary + '15' }]}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="cube" size={48} color={colors.primary} />
          </View>
          <ThemedText style={styles.heroTitle}>{detail.product.name}</ThemedText>
          {detail.product.code && (
            <View style={styles.heroBadge}>
              <Ionicons name="barcode" size={14} color={colors.primary} />
              <ThemedText style={[styles.heroBadgeText, { color: colors.primary }]}>
                {detail.product.code}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
              <Ionicons name="layers" size={24} color="#3B82F6" />
            </View>
            <ThemedText style={styles.statValue}>{detail.totalStock}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Toplam Stok
            </ThemedText>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#10B981' + '20' }]}>
              <Ionicons name="business" size={24} color="#10B981" />
            </View>
            <ThemedText style={styles.statValue}>{detail.warehouseStocks.length}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Depo Sayısı
            </ThemedText>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: (hasLowStock ? '#F59E0B' : '#10B981') + '20' },
              ]}
            >
              <Ionicons
                name={hasLowStock ? 'warning' : 'checkmark-circle'}
                size={24}
                color={hasLowStock ? '#F59E0B' : '#10B981'}
              />
            </View>
            <ThemedText style={styles.statValue}>{activeAssignments.length}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Aktif Zimmet
            </ThemedText>
          </Card>
        </View>

        {/* Product Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Ürün Bilgileri</ThemedText>
          </View>
          <View style={styles.infoGrid}>
            {detail.product.category && (
              <View style={styles.infoItem}>
                <View style={styles.infoRow}>
                  <Ionicons name="pricetag" size={16} color={colors.textSecondary} />
                  <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Kategori
                  </ThemedText>
                </View>
                <ThemedText style={styles.infoValue}>{detail.product.category}</ThemedText>
              </View>
            )}
            {detail.product.unit && (
              <View style={styles.infoItem}>
                <View style={styles.infoRow}>
                  <Ionicons name="scale" size={16} color={colors.textSecondary} />
                  <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Birim
                  </ThemedText>
                </View>
                <ThemedText style={styles.infoValue}>{detail.product.unit}</ThemedText>
              </View>
            )}
          </View>
          {detail.product.description && (
            <View style={styles.descriptionContainer}>
              <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
                {detail.product.description}
              </ThemedText>
            </View>
          )}
        </Card>

        {/* Warehouse Stocks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Depo Bazlı Stok</ThemedText>
          </View>
          {detail.warehouseStocks.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="archive-outline" size={32} color={colors.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Depo bilgisi bulunmuyor
              </ThemedText>
            </Card>
          ) : (
            detail.warehouseStocks.map((stock) => (
              <Card key={stock.stockId} style={styles.warehouseCard}>
                <View style={styles.warehouseHeader}>
                  <View style={styles.warehouseHeaderLeft}>
                    <View style={[styles.warehouseIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                      <Ionicons name="business" size={20} color="#3B82F6" />
                    </View>
                    <View>
                      <ThemedText style={styles.warehouseName}>{stock.warehouse.name}</ThemedText>
                      {stock.warehouse.code && (
                        <ThemedText style={[styles.warehouseCode, { color: colors.textSecondary }]}>
                          {stock.warehouse.code}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  {stock.isLowStock && (
                    <View style={styles.lowStockBadge}>
                      <Ionicons name="warning" size={12} color="#DC2626" />
                      <ThemedText style={styles.lowStockText}>Düşük</ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.warehouseStats}>
                  <View style={styles.warehouseStatItem}>
                    <Ionicons name="cube" size={16} color={colors.textSecondary} />
                    <ThemedText style={[styles.warehouseStatLabel, { color: colors.textSecondary }]}>
                      Mevcut
                    </ThemedText>
                    <ThemedText style={styles.warehouseStatValue}>{stock.currentStock}</ThemedText>
                  </View>
                  {(stock.minStock !== null || stock.maxStock !== null) && (
                    <View style={styles.warehouseStatItem}>
                      <Ionicons name="resize" size={16} color={colors.textSecondary} />
                      <ThemedText style={[styles.warehouseStatLabel, { color: colors.textSecondary }]}>
                        Min/Max
                      </ThemedText>
                      <ThemedText style={styles.warehouseStatValue}>
                        {stock.minStock ?? '-'} / {stock.maxStock ?? '-'}
                      </ThemedText>
                    </View>
                  )}
                </View>

                {stock.lastMovementDate && (
                  <View style={styles.warehouseFooter}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <ThemedText style={[styles.warehouseFooterText, { color: colors.textSecondary }]}>
                      Son hareket: {formatDate(stock.lastMovementDate)}
                    </ThemedText>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>

        {/* Stock Movements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Son Stok Hareketleri</ThemedText>
          </View>
          {detail.recentMovements.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={32} color={colors.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Hareket kaydı bulunmuyor
              </ThemedText>
            </Card>
          ) : (
            detail.recentMovements.map((movement) => {
              const isIn = movement.movementType === 'IN';
              const isOut = movement.movementType === 'OUT';
              return (
                <Card key={movement.id} style={styles.movementCard}>
                  <View style={styles.movementHeader}>
                    <View
                      style={[
                        styles.movementIconContainer,
                        {
                          backgroundColor: (isIn ? '#10B981' : isOut ? '#EF4444' : '#6B7280') + '20',
                        },
                      ]}
                    >
                      <Ionicons
                        name={isIn ? 'arrow-down' : isOut ? 'arrow-up' : 'swap-horizontal'}
                        size={18}
                        color={isIn ? '#10B981' : isOut ? '#EF4444' : '#6B7280'}
                      />
                    </View>
                    <View style={styles.movementHeaderContent}>
                      <ThemedText style={styles.movementType}>
                        {isIn ? 'Giriş' : isOut ? 'Çıkış' : 'Düzeltme'}
                      </ThemedText>
                      <ThemedText style={[styles.movementDate, { color: colors.textSecondary }]}>
                        {formatDate(movement.createdAt)}
                      </ThemedText>
                    </View>
                    <View style={styles.movementQuantity}>
                      <ThemedText
                        style={[
                          styles.movementQuantityText,
                          { color: isIn ? '#10B981' : isOut ? '#EF4444' : '#6B7280' },
                        ]}
                      >
                        {isIn ? '+' : '-'}
                        {Math.abs(movement.quantity)}
                      </ThemedText>
                    </View>
                  </View>
                  {movement.notes && (
                    <View style={styles.movementNotes}>
                      <ThemedText style={[styles.movementNotesText, { color: colors.textSecondary }]}>
                        {movement.notes}
                      </ThemedText>
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </View>

        {/* Assignments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Zimmet Bilgileri</ThemedText>
            {!assignmentsLoading && assignments.length > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{assignments.length}</ThemedText>
              </View>
            )}
          </View>
          {assignmentsLoading ? (
            <Card style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.primary} />
            </Card>
          ) : assignments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="person-outline" size={32} color={colors.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Zimmet kaydı bulunmuyor
              </ThemedText>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.assignmentHeader}>
                  <View style={styles.assignmentHeaderLeft}>
                    <View
                      style={[
                        styles.assignmentIconContainer,
                        { backgroundColor: getStatusColor(assignment.status) + '20' },
                      ]}
                    >
                      <Ionicons
                        name={
                          assignment.isUserAssignment
                            ? 'person'
                            : assignment.isLocationAssignment
                              ? 'location'
                              : 'cube'
                        }
                        size={20}
                        color={getStatusColor(assignment.status)}
                      />
                    </View>
                    <View>
                      <ThemedText style={styles.assignmentTitle}>
                        Zimmet #{assignment.id}
                      </ThemedText>
                      <ThemedText style={[styles.assignmentSubtitle, { color: colors.textSecondary }]}>
                        {formatDateTime(assignment.assignmentDate)}
                      </ThemedText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(assignment.status) + '20' },
                    ]}
                  >
                    <ThemedText
                      style={[styles.statusText, { color: getStatusColor(assignment.status) }]}
                    >
                      {getStatusLabel(assignment.status)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.assignmentContent}>
                  {assignment.isUserAssignment && assignment.assignedUserName && (
                    <View style={styles.assignmentInfoRow}>
                      <Ionicons name="person-circle" size={16} color={colors.textSecondary} />
                      <ThemedText style={[styles.assignmentInfoLabel, { color: colors.textSecondary }]}>
                        Kullanıcı:
                      </ThemedText>
                      <ThemedText style={styles.assignmentInfoValue}>
                        {assignment.assignedUserName}
                      </ThemedText>
                    </View>
                  )}

                  {assignment.isLocationAssignment && (
                    <>
                      {assignment.assignedLocationName && (
                        <View style={styles.assignmentInfoRow}>
                          <Ionicons name="location" size={16} color={colors.textSecondary} />
                          <ThemedText style={[styles.assignmentInfoLabel, { color: colors.textSecondary }]}>
                            Konum:
                          </ThemedText>
                          <ThemedText style={styles.assignmentInfoValue}>
                            {assignment.assignedLocationName}
                          </ThemedText>
                        </View>
                      )}
                      {assignment.locationName && (
                        <View style={styles.assignmentInfoRow}>
                          <Ionicons name="map" size={16} color={colors.textSecondary} />
                          <ThemedText style={[styles.assignmentInfoLabel, { color: colors.textSecondary }]}>
                            Detay:
                          </ThemedText>
                          <ThemedText style={styles.assignmentInfoValue}>{assignment.locationName}</ThemedText>
                        </View>
                      )}
                    </>
                  )}

                  <View style={styles.assignmentInfoRow}>
                    <Ionicons name="cube" size={16} color={colors.textSecondary} />
                    <ThemedText style={[styles.assignmentInfoLabel, { color: colors.textSecondary }]}>
                      Miktar:
                    </ThemedText>
                    <ThemedText style={styles.assignmentInfoValue}>{assignment.quantity}</ThemedText>
                  </View>

                  {assignment.serialNumber && (
                    <View style={styles.assignmentInfoRow}>
                      <Ionicons name="barcode" size={16} color={colors.textSecondary} />
                      <ThemedText style={[styles.assignmentInfoLabel, { color: colors.textSecondary }]}>
                        Seri No:
                      </ThemedText>
                      <ThemedText style={styles.assignmentInfoValue}>{assignment.serialNumber}</ThemedText>
                    </View>
                  )}

                  {assignment.expectedReturnDate && (
                    <View style={styles.assignmentInfoRow}>
                      <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                      <ThemedText style={[styles.assignmentInfoLabel, { color: colors.textSecondary }]}>
                        Beklenen İade:
                      </ThemedText>
                      <ThemedText style={styles.assignmentInfoValue}>
                        {formatDate(assignment.expectedReturnDate)}
                      </ThemedText>
                    </View>
                  )}

                  {assignment.actualReturnDate && (
                    <View style={styles.assignmentInfoRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.textSecondary} />
                      <ThemedText style={[styles.assignmentInfoLabel, { color: colors.textSecondary }]}>
                        İade Tarihi:
                      </ThemedText>
                      <ThemedText style={styles.assignmentInfoValue}>
                        {formatDateTime(assignment.actualReturnDate)}
                      </ThemedText>
                    </View>
                  )}
                </View>

                {assignment.notes && (
                  <View style={styles.assignmentNotes}>
                    <Ionicons name="document-text" size={14} color={colors.textSecondary} />
                    <ThemedText style={[styles.assignmentNotesText, { color: colors.textSecondary }]}>
                      {assignment.notes}
                    </ThemedText>
                  </View>
                )}

                {assignment.isExpired && assignment.status === AssignmentStatus.ACTIVE && (
                  <View style={styles.expiredBadge}>
                    <Ionicons name="warning" size={14} color="#D97706" />
                    <ThemedText style={styles.expiredText}>Süresi Dolmuş</ThemedText>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Hero Section
  heroSection: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '600',
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
  // Section
  section: {
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
  badge: {
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Info Card
  infoCard: {
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Warehouse Card
  warehouseCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  warehouseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  warehouseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warehouseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  warehouseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  warehouseCode: {
    fontSize: 12,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  lowStockText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  warehouseStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  warehouseStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warehouseStatLabel: {
    fontSize: 12,
    flex: 1,
  },
  warehouseStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  warehouseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  warehouseFooterText: {
    fontSize: 11,
  },
  // Movement Card
  movementCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  movementHeaderContent: {
    flex: 1,
  },
  movementType: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  movementDate: {
    fontSize: 12,
  },
  movementQuantity: {
    alignItems: 'flex-end',
  },
  movementQuantityText: {
    fontSize: 18,
    fontWeight: '700',
  },
  movementNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    gap: 6,
  },
  movementNotesText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  // Assignment Card
  assignmentCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assignmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assignmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  assignmentSubtitle: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  assignmentContent: {
    gap: 10,
  },
  assignmentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignmentInfoLabel: {
    fontSize: 13,
  },
  assignmentInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  assignmentNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    gap: 8,
  },
  assignmentNotesText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  expiredBadge: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
  },
  expiredText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  // Empty States
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  loadingCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
