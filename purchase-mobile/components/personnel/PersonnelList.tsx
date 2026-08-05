import { Button, EmptyState, Input, Loading, Select, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { personnelService } from '@/services/api/personnel.service';
import { schoolService } from '@/services/api/school.service';
import {
  EMPLOYMENT_TYPE_OPTIONS,
  PERSONNEL_ROLE_OPTIONS,
  PERSONNEL_STATUS_OPTIONS,
  fullName,
  type SchoolPersonnel,
} from '@/services/types/personnel.types';
import type { School } from '@/services/types/school.types';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { PersonnelListItem } from './PersonnelListItem';

const PAGE_SIZE = 10;

export type PersonnelListProps = {
  onPress?: (person: SchoolPersonnel) => void;
  onEdit?: (person: SchoolPersonnel) => void;
  onCreate?: () => void;
  refreshKey?: number;
};

export function PersonnelList({
  onPress,
  onEdit,
  onCreate,
  refreshKey = 0,
}: PersonnelListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [personnel, setPersonnel] = useState<SchoolPersonnel[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedMode, setPaginatedMode] = useState(true);

  const loadSchools = useCallback(async () => {
    if (!token) return;
    try {
      const active = await schoolService.getActiveSchools(token);
      setSchools(active);
    } catch (err) {
      console.error('Failed to load schools for personnel filter:', err);
    }
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setPersonnel([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pageParams = { page, size: PAGE_SIZE, sort: 'firstName,asc' };

      if (selectedRole) {
        const data = await personnelService.getPersonnelByRole(selectedRole, token);
        setPersonnel(data);
        setTotalElements(data.length);
        setTotalPages(1);
        setPaginatedMode(false);
      } else if (selectedStatus) {
        const data = await personnelService.getPersonnelByStatus(selectedStatus, token);
        setPersonnel(data);
        setTotalElements(data.length);
        setTotalPages(1);
        setPaginatedMode(false);
      } else if (selectedEmploymentType) {
        const data = await personnelService.getPersonnelByEmploymentType(
          selectedEmploymentType,
          token
        );
        setPersonnel(data);
        setTotalElements(data.length);
        setTotalPages(1);
        setPaginatedMode(false);
      } else if (searchQuery.trim()) {
        const response = await personnelService.searchPersonnel(token, {
          ...pageParams,
          query: searchQuery.trim(),
        });
        setPersonnel(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
        setPaginatedMode(true);
      } else if (selectedSchool) {
        const response = await personnelService.getPersonnelBySchool(
          Number(selectedSchool),
          token,
          pageParams
        );
        setPersonnel(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
        setPaginatedMode(true);
      } else {
        const response = await personnelService.getAllPersonnel(token, pageParams);
        setPersonnel(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
        setPaginatedMode(true);
      }
    } catch (err) {
      console.error('Failed to fetch personnel:', err);
      setPersonnel([]);
      setTotalElements(0);
      setTotalPages(0);
      setError('Personel listesi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [
    token,
    page,
    searchQuery,
    selectedSchool,
    selectedRole,
    selectedStatus,
    selectedEmploymentType,
  ]);

  useEffect(() => {
    void loadSchools();
  }, [loadSchools, refreshKey]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadSchools()]);
    setRefreshing(false);
  };

  const resetPage = () => setPage(0);

  const handleSearchSubmit = () => {
    setSelectedSchool(null);
    setSelectedRole(null);
    setSelectedStatus(null);
    setSelectedEmploymentType(null);
    resetPage();
    setSearchQuery(searchTerm.trim());
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchQuery('');
    setSelectedSchool(null);
    setSelectedRole(null);
    setSelectedStatus(null);
    setSelectedEmploymentType(null);
    resetPage();
  };

  const hasFilters = Boolean(
    searchQuery || selectedSchool || selectedRole || selectedStatus || selectedEmploymentType
  );

  const handleDelete = (person: SchoolPersonnel) => {
    Alert.alert(
      'Personeli sil',
      `"${fullName(person)}" personelini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              if (!token) return;
              try {
                await personnelService.deletePersonnel(person.id, token);
                setPersonnel((prev) => prev.filter((p) => p.id !== person.id));
                setTotalElements((prev) => Math.max(0, prev - 1));
              } catch (err: unknown) {
                const message =
                  err instanceof Error ? err.message : 'Personel silinirken bir hata oluştu';
                Alert.alert('Hata', message);
              }
            })();
          },
        },
      ]
    );
  };

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <Input
        placeholder="Personel ara…"
        value={searchTerm}
        onChangeText={(text) => {
          setSearchTerm(text);
          if (!text.trim()) setSearchQuery('');
        }}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <Select
        label="Okul"
        placeholder="Tüm okullar"
        options={schools.map((s) => ({ label: s.name, value: String(s.id) }))}
        value={selectedSchool}
        onChange={(value) => {
          setSelectedSchool(value);
          setSelectedRole(null);
          setSelectedStatus(null);
          setSelectedEmploymentType(null);
          setSearchQuery('');
          setSearchTerm('');
          resetPage();
        }}
        clearable
        searchable
      />
      <Select
        label="Görev"
        placeholder="Tüm roller"
        options={PERSONNEL_ROLE_OPTIONS}
        value={selectedRole}
        onChange={(value) => {
          setSelectedRole(value);
          setSelectedSchool(null);
          setSelectedStatus(null);
          setSelectedEmploymentType(null);
          setSearchQuery('');
          setSearchTerm('');
          resetPage();
        }}
        clearable
        searchable={false}
      />
      <Select
        label="Durum"
        placeholder="Tüm durumlar"
        options={PERSONNEL_STATUS_OPTIONS}
        value={selectedStatus}
        onChange={(value) => {
          setSelectedStatus(value);
          setSelectedSchool(null);
          setSelectedRole(null);
          setSelectedEmploymentType(null);
          setSearchQuery('');
          setSearchTerm('');
          resetPage();
        }}
        clearable
        searchable={false}
      />
      <Select
        label="İstihdam türü"
        placeholder="Tüm istihdam türleri"
        options={EMPLOYMENT_TYPE_OPTIONS}
        value={selectedEmploymentType}
        onChange={(value) => {
          setSelectedEmploymentType(value);
          setSelectedSchool(null);
          setSelectedRole(null);
          setSelectedStatus(null);
          setSearchQuery('');
          setSearchTerm('');
          resetPage();
        }}
        clearable
        searchable={false}
      />
      {hasFilters ? (
        <Button title="Filtreleri temizle" variant="ghost" onPress={clearFilters} />
      ) : null}
    </View>
  );

  const footer =
    personnel.length > 0 ? (
      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        <Text variant="caption" center>
          Toplam {totalElements} personel
        </Text>
        {paginatedMode && totalPages > 1 ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              title="Önceki"
              variant="outline"
              size="small"
              style={{ flex: 1 }}
              disabled={page <= 0}
              onPress={() => setPage((p) => Math.max(0, p - 1))}
            />
            <Text variant="caption" center style={{ alignSelf: 'center', minWidth: 64 }}>
              {page + 1} / {totalPages}
            </Text>
            <Button
              title="Sonraki"
              variant="outline"
              size="small"
              style={{ flex: 1 }}
              disabled={page >= totalPages - 1}
              onPress={() => setPage((p) => p + 1)}
            />
          </View>
        ) : null}
      </View>
    ) : null;

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <Loading fullScreen label="Personel yükleniyor…" />
      </View>
    );
  }

  if (!loading && personnel.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Personel yok'}
          description={error ?? 'Henüz personel kaydı bulunmuyor'}
          icon={error ? 'cloud-offline-outline' : 'people-outline'}
          actionTitle={error ? 'Tekrar dene' : onCreate ? 'Yeni personel' : undefined}
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={personnel}
      keyExtractor={(item) => `personnel-${item.id}`}
      renderItem={({ item }) => (
        <PersonnelListItem
          person={item}
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
      ListFooterComponent={footer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    />
  );
}
