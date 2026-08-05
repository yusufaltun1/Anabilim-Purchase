import { Button, EmptyState, Input, Loading, Select, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { schoolService } from '@/services/api/school.service';
import {
  SCHOOL_TYPE_OPTIONS,
  type School,
} from '@/services/types/school.types';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { SchoolListItem } from './SchoolListItem';

const PAGE_SIZE = 20;

export type SchoolListProps = {
  onPress?: (school: School) => void;
  onEdit?: (school: School) => void;
  onCreate?: () => void;
  refreshKey?: number;
};

export function SchoolList({
  onPress,
  onEdit,
  onCreate,
  refreshKey = 0,
}: SchoolListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSchoolType, setSelectedSchoolType] = useState<string | null>(null);

  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const loadCitiesAndDistricts = useCallback(async () => {
    if (!token) return;
    try {
      const active = await schoolService.getActiveSchools(token);
      setCities([...new Set(active.map((s) => s.city).filter(Boolean))].sort());
      setDistricts([...new Set(active.map((s) => s.district).filter(Boolean))].sort());
    } catch (err) {
      console.error('Failed to load school filter options:', err);
    }
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setSchools([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (selectedCity) {
        const data = await schoolService.getSchoolsByCity(selectedCity, token);
        setSchools(data);
        setTotalElements(data.length);
      } else if (selectedDistrict) {
        const data = await schoolService.getSchoolsByDistrict(selectedDistrict, token);
        setSchools(data);
        setTotalElements(data.length);
      } else if (selectedSchoolType) {
        const data = await schoolService.getSchoolsByType(selectedSchoolType, token);
        setSchools(data);
        setTotalElements(data.length);
      } else if (searchQuery.trim()) {
        const response = await schoolService.searchSchools(token, {
          query: searchQuery.trim(),
          page: 0,
          size: PAGE_SIZE,
        });
        setSchools(response.content);
        setTotalElements(response.totalElements);
      } else {
        const response = await schoolService.getAllSchools(token, {
          page: 0,
          size: PAGE_SIZE,
          sort: 'name,asc',
        });
        setSchools(response.content);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err);
      setSchools([]);
      setTotalElements(0);
      setError('Okullar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, selectedCity, selectedDistrict, selectedSchoolType]);

  useEffect(() => {
    void loadCitiesAndDistricts();
  }, [loadCitiesAndDistricts, refreshKey]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadCitiesAndDistricts()]);
    setRefreshing(false);
  };

  const handleSearchSubmit = () => {
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedSchoolType(null);
    setSearchQuery(searchTerm.trim());
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchQuery('');
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedSchoolType(null);
  };

  const hasFilters = Boolean(
    searchQuery || selectedCity || selectedDistrict || selectedSchoolType
  );

  const handleDelete = (school: School) => {
    Alert.alert('Okulu sil', `"${school.name}" silinecek. Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!token) return;
            try {
              await schoolService.deleteSchool(school.id, token);
              setSchools((prev) => prev.filter((s) => s.id !== school.id));
              setTotalElements((prev) => Math.max(0, prev - 1));
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : 'Okul silinirken bir hata oluştu';
              Alert.alert('Hata', message);
            }
          })();
        },
      },
    ]);
  };

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <Input
        placeholder="Okul ara…"
        value={searchTerm}
        onChangeText={(text) => {
          setSearchTerm(text);
          if (!text.trim()) setSearchQuery('');
        }}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <Select
        label="Şehir"
        placeholder="Tüm şehirler"
        options={cities.map((c) => ({ label: c, value: c }))}
        value={selectedCity}
        onChange={(value) => {
          setSelectedCity(value);
          setSelectedDistrict(null);
          setSelectedSchoolType(null);
          setSearchQuery('');
        }}
        clearable
        searchable
      />
      <Select
        label="İlçe"
        placeholder="Tüm ilçeler"
        options={districts.map((d) => ({ label: d, value: d }))}
        value={selectedDistrict}
        onChange={(value) => {
          setSelectedDistrict(value);
          setSelectedCity(null);
          setSelectedSchoolType(null);
          setSearchQuery('');
        }}
        clearable
        searchable
      />
      <Select
        label="Okul türü"
        placeholder="Tüm türler"
        options={SCHOOL_TYPE_OPTIONS}
        value={selectedSchoolType}
        onChange={(value) => {
          setSelectedSchoolType(value);
          setSelectedCity(null);
          setSelectedDistrict(null);
          setSearchQuery('');
        }}
        clearable
        searchable={false}
      />
      {hasFilters ? (
        <Button title="Filtreleri temizle" variant="ghost" onPress={clearFilters} />
      ) : null}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <Loading fullScreen label="Okullar yükleniyor…" />
      </View>
    );
  }

  if (!loading && schools.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Okul yok'}
          description={error ?? 'Henüz okul kaydı bulunmuyor'}
          icon={error ? 'cloud-offline-outline' : 'school-outline'}
          actionTitle={error ? 'Tekrar dene' : onCreate ? 'Yeni okul' : undefined}
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={schools}
      keyExtractor={(item) => `school-${item.id}`}
      renderItem={({ item }) => (
        <SchoolListItem
          school={item}
          onPress={onPress ? () => onPress(item) : undefined}
          onEdit={onEdit ? () => onEdit(item) : undefined}
          onDelete={() => handleDelete(item)}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={<View style={{ marginBottom: spacing.sm }}>{header}</View>}
      ListFooterComponent={
        schools.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {totalElements} okul
          </Text>
        ) : null
      }
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    />
  );
}
