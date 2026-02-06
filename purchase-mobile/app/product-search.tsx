import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { productService } from '@/services/api/product.service';
import { ProductStockSummary } from '@/services/types/product.types';

export default function ProductSearchScreen() {
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductStockSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!token) return;
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setSearched(true);
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      const data = await productService.searchProducts(trimmed, token);
      setResults(data);
    } catch (error) {
      console.error('Product search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [query, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      } else if (query.trim().length === 0) {
        setResults([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleBarcodeScan = (barcode: string) => {
    setQuery(barcode);
    setScannerVisible(false);
    // Barcode tarandığında otomatik arama yapılacak (useEffect tetiklenecek)
  };

  const onRefresh = async () => {
    if (query.trim().length >= 2) {
      setRefreshing(true);
      await handleSearch();
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: ProductStockSummary }) => (
    <Card
      style={[styles.resultCard, { backgroundColor: colors.background }]}
      onPress={() => router.push(`/product-detail/${item.id}`)}
    >
      <View style={styles.resultContent}>
        <View style={[styles.resultIconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="cube" size={24} color={colors.primary} />
        </View>
        <View style={styles.resultInfo}>
          <ThemedText style={styles.resultTitle} numberOfLines={2}>
            {item.name}
          </ThemedText>
          {item.code && (
            <View style={styles.resultCodeContainer}>
              <Ionicons name="barcode" size={12} color={colors.textSecondary} />
              <ThemedText style={[styles.resultCode, { color: colors.textSecondary }]}>
                {item.code}
              </ThemedText>
            </View>
          )}
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Ionicons name="layers" size={14} color={colors.textSecondary} />
              <ThemedText style={[styles.resultStatText, { color: colors.textSecondary }]}>
                {item.totalStock ?? 0}
              </ThemedText>
            </View>
            <View style={styles.resultStatItem}>
              <Ionicons name="business" size={14} color={colors.textSecondary} />
              <ThemedText style={[styles.resultStatText, { color: colors.textSecondary }]}>
                {item.warehouseCount ?? 0} depo
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.resultRight}>
          {item.hasLowStock && (
            <View style={styles.lowStockBadge}>
              <Ionicons name="warning" size={12} color="#DC2626" />
              <ThemedText style={styles.lowStockText}>Düşük</ThemedText>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </View>
    </Card>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Ürün Arama' }} />
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, { borderColor: colors.border, flex: 1 }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              placeholder="Ürün adı veya kodu ile ara..."
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              style={[styles.searchInput, { color: colors.text }]}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.barcodeButton, { backgroundColor: colors.primary }]}
            onPress={() => setScannerVisible(true)}
          >
            <Ionicons name="barcode-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Aranıyor...
          </ThemedText>
        </View>
      ) : results.length > 0 ? (
        <>
          <View style={styles.resultsHeader}>
            <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {results.length} sonuç bulundu
            </ThemedText>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
        </>
      ) : searched ? (
        <View style={styles.centerContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
          </View>
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
            Sonuç bulunamadı
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Farklı bir arama terimi deneyin
          </ThemedText>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
          </View>
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
            Ürün Ara
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Ürün adı veya kodu ile arama yapın
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  barcodeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  resultCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  resultIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  resultCode: {
    fontSize: 12,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  resultStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultStatText: {
    fontSize: 12,
  },
  resultRight: {
    alignItems: 'flex-end',
    gap: 8,
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
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
