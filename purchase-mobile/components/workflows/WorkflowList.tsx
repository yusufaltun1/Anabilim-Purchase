import { EmptyState, Input, Loading, SegmentedControl, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { workflowService } from '@/services/api/workflow.service';
import type { ApprovalWorkflow, WorkflowFilter } from '@/services/types/workflow.types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { WorkflowListItem } from './WorkflowListItem';

const FILTER_OPTIONS: Array<{ key: WorkflowFilter; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'active', label: 'Aktif' },
  { key: 'inactive', label: 'Pasif' },
];

export type WorkflowListProps = {
  onPress?: (workflow: ApprovalWorkflow) => void;
  onEdit?: (workflow: ApprovalWorkflow) => void;
  onCreate?: () => void;
  refreshKey?: number;
};

export function WorkflowList({
  onPress,
  onEdit,
  onCreate,
  refreshKey = 0,
}: WorkflowListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<WorkflowFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setWorkflows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data =
        filter === 'active'
          ? await workflowService.getActiveWorkflows(token)
          : await workflowService.getAllWorkflows(token);
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      setWorkflows([]);
      setError("Workflow'lar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredWorkflows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return workflows.filter((workflow) => {
      const matchesSearch =
        !q ||
        workflow.name.toLowerCase().includes(q) ||
        (workflow.description ?? '').toLowerCase().includes(q) ||
        (workflow.category ?? '').toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (filter === 'active') return !!workflow.isActive;
      if (filter === 'inactive') return !workflow.isActive;
      return true;
    });
  }, [workflows, searchTerm, filter]);

  const handleDelete = (workflow: ApprovalWorkflow) => {
    if (!workflow.id) return;
    Alert.alert(
      "Workflow'u sil",
      "Bu workflow'u silmek istediğinizden emin misiniz?",
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              if (!token || !workflow.id) return;
              try {
                await workflowService.deleteWorkflow(workflow.id, token);
                setWorkflows((prev) => prev.filter((w) => w.id !== workflow.id));
              } catch (err: unknown) {
                const message =
                  err instanceof Error ? err.message : 'Workflow silinirken bir hata oluştu';
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
        placeholder="Workflow adı, açıklama veya kategori ara…"
        value={searchTerm}
        onChangeText={setSearchTerm}
        returnKeyType="search"
      />
      <SegmentedControl
        options={FILTER_OPTIONS}
        value={filter}
        onChange={(key) => setFilter(key as WorkflowFilter)}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <Loading fullScreen label="Workflow'lar yükleniyor…" />
      </View>
    );
  }

  if (!loading && filteredWorkflows.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Workflow yok'}
          description={
            error ??
            (searchTerm || filter !== 'all'
              ? 'Arama kriterlerinize uygun workflow bulunamadı'
              : 'Henüz workflow kaydı bulunmuyor')
          }
          icon={error ? 'cloud-offline-outline' : 'git-branch-outline'}
          actionTitle={
            error
              ? 'Tekrar dene'
              : !searchTerm && filter === 'all' && onCreate
                ? 'Yeni workflow'
                : undefined
          }
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredWorkflows}
      keyExtractor={(item) => `workflow-${item.id ?? item.name}`}
      renderItem={({ item }) => (
        <WorkflowListItem
          workflow={item}
          onPress={
            onPress
              ? () => onPress(item)
              : onEdit
                ? () => onEdit(item)
                : undefined
          }
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
        filteredWorkflows.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {filteredWorkflows.length} workflow
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
