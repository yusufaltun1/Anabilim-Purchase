import { AssignmentReturnModal } from '@/components/assignments';
import { Button, Card, EmptyState, Loading, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { assignmentService } from '@/services/api/assignment.service';
import { canCancelAssignment } from '@/services/types/assignment.types';
import { AssignmentStatus, type Assignment } from '@/services/types/product.types';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export type UserAssignmentsSectionProps = {
  userId: number;
};

export function UserAssignmentsSection({ userId }: UserAssignmentsSectionProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnTarget, setReturnTarget] = useState<Assignment | null>(null);
  const [returning, setReturning] = useState(false);

  const loadAssignments = useCallback(async () => {
    if (!token || !userId) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await assignmentService.getActiveAssignmentsByUserId(userId, token);
      setAssignments(list);
    } catch (err) {
      console.error('Failed to load user assignments:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const handleCancel = (assignment: Assignment) => {
    Alert.alert(
      'Zimmeti iptal et',
      `"${assignment.productName}" zimmeti iptal edilecek.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal et',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              if (!token) return;
              try {
                await assignmentService.cancelAssignment(assignment.id, token);
                await loadAssignments();
              } catch (err: unknown) {
                Alert.alert(
                  'Hata',
                  err instanceof Error ? err.message : 'Zimmet iptal edilemedi'
                );
              }
            })();
          },
        },
      ]
    );
  };

  const handleReturnSubmit = async (payload: {
    warehouseId: number;
    notes?: string;
    photoUri: string;
    photoName?: string;
    photoMimeType?: string;
    documentUri?: string;
    documentName?: string;
    documentMimeType?: string;
  }) => {
    if (!token || !returnTarget) return;
    setReturning(true);
    try {
      await assignmentService.returnAssignment(returnTarget.id, payload, token);
      setReturnTarget(null);
      await loadAssignments();
    } catch (err: unknown) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Zimmet iade edilemedi');
    } finally {
      setReturning(false);
    }
  };

  return (
    <Card style={{ marginTop: spacing.md }}>
      <Text variant="bodyStrong" style={{ marginBottom: spacing.xs }}>
        Aktif zimmetler
      </Text>
      <Text variant="caption" style={{ marginBottom: spacing.md }}>
        Kullanıcıya atanmış aktif zimmetler
      </Text>

      {loading ? (
        <Loading label="Zimmetler yükleniyor…" />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Aktif zimmet yok"
          description="Bu kullanıcıya ait aktif zimmet bulunmuyor"
          icon="cube-outline"
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {assignments.map((a) => {
            const canReturn =
              a.canBeReturned ||
              (a.status === AssignmentStatus.ACTIVE && a.isUserAssignment);
            const canCancel = canCancelAssignment(a);
            return (
              <View
                key={`assignment-${a.id}`}
                style={{
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  borderRadius: 8,
                  padding: spacing.md,
                  gap: spacing.sm,
                }}
              >
                <Text variant="bodyStrong" numberOfLines={2}>
                  {a.productName}
                </Text>
                <Text variant="caption">
                  {[a.productCode, a.serialNumber].filter(Boolean).join(' · ') || `Zimmet #${a.id}`}
                </Text>
                {a.quantity != null ? (
                  <Text variant="caption">Adet: {a.quantity}</Text>
                ) : null}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
                  {canReturn ? (
                    <Button
                      title="İade"
                      size="small"
                      variant="outline"
                      onPress={() => setReturnTarget(a)}
                    />
                  ) : null}
                  {canCancel ? (
                    <Button
                      title="İptal"
                      size="small"
                      variant="destructive"
                      onPress={() => handleCancel(a)}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <AssignmentReturnModal
        visible={!!returnTarget}
        assignment={returnTarget}
        submitting={returning}
        onClose={() => setReturnTarget(null)}
        onSubmit={handleReturnSubmit}
      />
    </Card>
  );
}
