import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  // Rol kontrolü yardımcı fonksiyonları
  const isAdmin = user?.roles?.includes('SYSTEM_ADMIN');
  const isTeacher = !isAdmin;

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  // Rol bazlı buton işlevleri
  const handleCreateRequest = () => {
    router.push('/create-request');
  };

  const handleApproveRequests = () => {
    Alert.alert('Bilgi', 'Talep onaylama sayfası yakında eklenecek');
  };

  const handleMyRequests = () => {
    Alert.alert('Bilgi', 'Taleplerim sayfası yakında eklenecek');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        {user && (
          <Card style={styles.userCard}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Kullanıcı Bilgileri
              </ThemedText>
            </View>
            
            <View style={styles.userInfoGrid}>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Ad Soyad:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`}
                </ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  E-posta:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {user.email}
                </ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Departman:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {user.department || 'Belirtilmemiş'}
                </ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Pozisyon:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {user.position || 'Belirtilmemiş'}
                </ThemedText>
              </View>
              
              {user.roles && user.roles.length > 0 && (
                <View style={styles.infoRow}>
                  <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Roller:
                  </ThemedText>
                  <View style={styles.rolesContainer}>
                    {user.roles.map((role, index) => (
                      <View key={index} style={[styles.roleBadge, { backgroundColor: colors.primaryMuted }]}>
                        <ThemedText style={[styles.roleText, { color: colors.primary }]}>
                          {role}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Role-based Quick Actions */}
        <View style={styles.actionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {isAdmin ? 'Yönetici İşlemleri' : 'Öğretmen İşlemleri'}
          </ThemedText>
          
          <View style={styles.actionsGrid}>
            {/* Talep Oluştur - Her iki rol için */}
            <Card style={styles.actionCard} onPress={handleCreateRequest}>
              <View style={[styles.actionIcon]}>
                <ThemedText style={[styles.actionIconText, { color: colors.primary }]}>
                  ➕
                </ThemedText>
              </View>
              <ThemedText style={styles.actionTitle}>Yeni Talep</ThemedText>
              <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                Satın alma talebi oluşturun
              </ThemedText>
            </Card>
            
            {/* Müdür için: Talep Onaylama */}
            {isAdmin && (
              <Card style={styles.actionCard} onPress={handleApproveRequests}>
                <View style={[styles.actionIcon]}>
                  <ThemedText style={[styles.actionIconText, { color: colors.primary }]}>
                    ✅
                  </ThemedText>
                </View>
                <ThemedText style={styles.actionTitle}>Talep Onaylama</ThemedText>
                <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  Bekleyen talepleri onaylayın
                </ThemedText>
              </Card>
            )}
            
            {/* Öğretmen için: Taleplerim */}
            {isTeacher && (
              <Card style={styles.actionCard} onPress={handleMyRequests}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primaryMuted }]}>
                  <ThemedText style={[styles.actionIconText, { color: colors.primary }]}>
                    📋
                  </ThemedText>
                </View>
                <ThemedText style={styles.actionTitle}>Taleplerim</ThemedText>
                <ThemedText style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  Taleplerinizi görüntüleyin
                </ThemedText>
              </Card>
            )}
          </View>
        </View>

        {/* Role-based Statistics */}
        <View style={styles.statsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            İstatistikler
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
                0
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {isAdmin ? 'Bekleyen Talep' : 'Toplam Talep'}
              </ThemedText>
            </Card>
            
            <Card style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
                0
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {isAdmin ? 'Onaylanan' : 'Onaylanan'}
              </ThemedText>
            </Card>
            
            <Card style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
                0
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {isAdmin ? 'Reddedilen' : 'Bekleyen'}
              </ThemedText>
            </Card>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Çıkış Yap"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  userCard: {
    marginBottom: 24,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  userInfoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 2,
    justifyContent: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    minHeight: 120,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    minHeight: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  logoutSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButton: {
    minWidth: 120,
  },
});
