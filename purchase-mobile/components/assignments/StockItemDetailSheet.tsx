import {
  BottomSheet,
  Button,
  ConfirmDialog,
  FilePickerField,
  SegmentedControl,
  Select,
  Text,
  TextArea,
  useToast,
  type PickedFile,
} from '@/components/ui';
import { AssignmentReturnModal } from '@/components/assignments/AssignmentReturnModal';
import { StockItemAssignmentForm } from '@/components/assignments/StockItemAssignmentForm';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { assignmentService } from '@/services/api/assignment.service';
import { warehouseService, type Warehouse } from '@/services/api/warehouse.service';
import {
  canCancelAssignment,
  isAssignableStockRow,
  stockItemSerialLabel,
  stockItemStatusLabel,
  type StockItem,
  type StockMovementDetail,
} from '@/services/types/assignment.types';
import { Assignment, AssignmentStatus } from '@/services/types/product.types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

type ManageTab = 'zimmet' | 'hareket' | 'gecmis';

export type StockItemDetailSheetProps = {
  visible: boolean;
  stockItem: StockItem | null;
  productId: number;
  canManage: boolean;
  onClose: () => void;
  onRefresh: () => void;
};

const movementTypeLabel: Record<string, string> = {
  IN: 'Giriş',
  OUT: 'Çıkış',
  ADJUSTMENT: 'Düzeltme',
};

const referenceTypeLabel: Record<string, string> = {
  MANUAL: 'Manuel',
  ASSIGNMENT: 'Zimmet',
  ASSIGNMENT_RETURN: 'Zimmet iadesi',
  ASSIGNMENT_CANCEL: 'Zimmet iptali',
  PURCHASE_ORDER: 'Satın alma',
  ADJUSTMENT: 'Düzeltme',
  TRANSFER: 'Transfer',
};

const assignmentStatusLabel: Record<string, string> = {
  ACTIVE: 'Aktif',
  RETURNED: 'İade',
  LOST: 'Kayıp',
  DAMAGED: 'Hasarlı',
  EXPIRED: 'Süresi doldu',
  TRANSFERRED: 'Transfer',
};

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function StockItemDetailSheet({
  visible,
  stockItem,
  productId,
  canManage,
  onClose,
  onRefresh,
}: StockItemDetailSheetProps) {
  const { token } = useAuth();
  const { spacing, colors } = useAppTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ManageTab>('zimmet');
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState<StockMovementDetail[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [movementNotes, setMovementNotes] = useState('');
  const [movementSubmitting, setMovementSubmitting] = useState(false);
  const [formDownloading, setFormDownloading] = useState(false);
  const [signedUploading, setSignedUploading] = useState(false);
  const [signedFile, setSignedFile] = useState<PickedFile | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returning, setReturning] = useState(false);

  const stockItemId = stockItem ? Number(stockItem.id) : 0;
  const canAssign = stockItem ? isAssignableStockRow(stockItem) : false;
  const inWarehouse = Boolean(stockItem?.warehouseId) && stockItem?.status === 'IN_STOCK';
  const serialLabel = stockItem ? stockItemSerialLabel(stockItem) : '';

  const activeAssignment = useMemo(
    () => assignments.find((a) => a.status === AssignmentStatus.ACTIVE),
    [assignments]
  );

  const tabOptions = useMemo(
    () => [
      { key: 'zimmet', label: 'Zimmet', icon: 'person-add' as const },
      { key: 'hareket', label: 'Stok', icon: 'swap-horizontal' as const },
      { key: 'gecmis', label: 'Geçmiş', icon: 'time' as const },
    ],
    []
  );

  const warehouseOptions = useMemo(
    () =>
      warehouses.map((w) => ({
        label: w.code ? `${w.name} (${w.code})` : w.name,
        value: String(w.id),
      })),
    [warehouses]
  );

  useEffect(() => {
    if (!visible) return;
    setActiveTab('zimmet');
    setMovementNotes('');
    setReturnModalOpen(false);
    setCancelConfirmVisible(false);
    setSignedFile(null);
  }, [visible, stockItemId]);

  useEffect(() => {
    if (!visible || !token || inWarehouse) return;
    warehouseService
      .getActiveWarehouses(token)
      .then(setWarehouses)
      .catch(() => setWarehouses([]));
  }, [visible, token, inWarehouse]);

  useEffect(() => {
    if (stockItem?.warehouseId) {
      setSelectedWarehouseId(String(stockItem.warehouseId));
    }
  }, [stockItem?.warehouseId]);

  const loadDetails = useCallback(async () => {
    if (!token || !stockItemId) return;
    try {
      setLoading(true);
      const [movementList, assignmentList] = await Promise.all([
        warehouseService.getStockItemMovements(stockItemId, token),
        assignmentService.getAssignmentsByStockItem(stockItemId, token),
      ]);
      setMovements(movementList);
      setAssignments(assignmentList);
    } catch {
      showToast({ message: 'Cihaz detayları yüklenemedi', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast, stockItemId, token]);

  useEffect(() => {
    if (!visible || !stockItemId) return;
    void loadDetails();
  }, [visible, stockItemId, loadDetails, stockItem?.status, stockItem?.assignedUserName]);

  const handleRefreshAll = async () => {
    await loadDetails();
    onRefresh();
  };

  const handleMovementSubmit = async () => {
    if (!token || !stockItem) return;
    const warehouseId = inWarehouse
      ? Number(stockItem.warehouseId)
      : Number(selectedWarehouseId);
    if (!warehouseId) {
      showToast({ message: 'Depo seçin', tone: 'error' });
      return;
    }
    const effectiveType = inWarehouse ? 'OUT' : 'IN';
    try {
      setMovementSubmitting(true);
      await warehouseService.createStockMovement(
        warehouseId,
        productId,
        {
          movementType: effectiveType,
          referenceType: 'MANUAL',
          referenceId: 0,
          quantity: 1,
          notes: movementNotes.trim() || `Manuel ${effectiveType === 'IN' ? 'giriş' : 'çıkış'}`,
          stockItemId,
        },
        token
      );
      showToast({ message: 'Stok hareketi kaydedildi', tone: 'success' });
      setMovementNotes('');
      await handleRefreshAll();
      setActiveTab('gecmis');
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Stok hareketi kaydedilemedi',
        tone: 'error',
      });
    } finally {
      setMovementSubmitting(false);
    }
  };

  const handleDownloadForm = async () => {
    if (!activeAssignment || !token) return;
    try {
      setFormDownloading(true);
      await assignmentService.downloadAssignmentForm(activeAssignment.id, token);
      showToast({ message: 'Form indirildi', tone: 'success' });
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Form indirilemedi',
        tone: 'error',
      });
    } finally {
      setFormDownloading(false);
    }
  };

  const handleUploadSigned = async (file: PickedFile | null) => {
    setSignedFile(file);
    if (!file || !activeAssignment || !token) return;
    try {
      setSignedUploading(true);
      await assignmentService.uploadSignedForm(
        activeAssignment.id,
        file.uri,
        file.name,
        token
      );
      showToast({ message: 'İmzalı form yüklendi', tone: 'success' });
      setSignedFile(null);
      await handleRefreshAll();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Yükleme başarısız',
        tone: 'error',
      });
    } finally {
      setSignedUploading(false);
    }
  };

  const handleCancelAssignment = async () => {
    if (!activeAssignment || !token) return;
    try {
      setCancelling(true);
      await assignmentService.cancelAssignment(activeAssignment.id, token);
      showToast({ message: 'Zimmet iptal edildi', tone: 'success' });
      setCancelConfirmVisible(false);
      await handleRefreshAll();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Zimmet iptal edilemedi',
        tone: 'error',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnAssignment = async (payload: {
    warehouseId: number;
    notes?: string;
    photoUri: string;
    photoName?: string;
    photoMimeType?: string;
    documentUri?: string;
    documentName?: string;
    documentMimeType?: string;
  }) => {
    if (!activeAssignment || !token) return;
    try {
      setReturning(true);
      await assignmentService.returnAssignment(activeAssignment.id, payload, token);
      showToast({ message: 'Zimmet iade edildi', tone: 'success' });
      setReturnModalOpen(false);
      await handleRefreshAll();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Zimmet iade edilemedi',
        tone: 'error',
      });
    } finally {
      setReturning(false);
    }
  };

  if (!stockItem) return null;

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        title="Cihaz yönetimi"
        contentStyle={{ maxHeight: '92%' }}
        footer={
          <Button title="Kapat" variant="secondary" onPress={onClose} fullWidth />
        }
      >
        <View style={{ marginBottom: spacing.md }}>
          <Text variant="h3" numberOfLines={2}>
            {serialLabel}
          </Text>
          <Text variant="caption" style={{ marginTop: 4 }}>
            {stockItemStatusLabel(stockItem)}
            {' · '}
            {stockItem.warehouseName || 'Depo dışında'}
            {stockItem.assignedUserName
              ? ` · Zimmet: ${stockItem.assignedUserName}`
              : activeAssignment
                ? ` · Zimmet: ${
                    activeAssignment.assignedUserName ||
                    activeAssignment.assignedLocationName ||
                    activeAssignment.locationName ||
                    '—'
                  }`
                : ' · Zimmet yok'}
          </Text>
        </View>

        <SegmentedControl
          options={tabOptions}
          value={activeTab}
          onChange={(key) => setActiveTab(key as ManageTab)}
          style={{ marginBottom: spacing.md }}
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 420 }}
        >
          {loading ? (
            <ActivityIndicator style={{ marginVertical: spacing.xl }} color={colors.primary} />
          ) : (
            <>
              {activeTab === 'zimmet' && (
                <View style={{ gap: spacing.md }}>
                  {activeAssignment ? (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        padding: spacing.md,
                        gap: spacing.sm,
                        backgroundColor: colors.backgroundSecondary,
                      }}
                    >
                      <Text variant="body">
                        <Text variant="bodyStrong">Aktif zimmet: </Text>
                        {activeAssignment.assignedUserName ||
                          activeAssignment.assignedLocationName ||
                          activeAssignment.locationName ||
                          '—'}
                        {activeAssignment.assignmentDate
                          ? ` · ${formatDate(activeAssignment.assignmentDate)}`
                          : ''}
                      </Text>
                      {canManage ? (
                        <View style={{ gap: spacing.sm }}>
                          <Button
                            title={formDownloading ? 'İndiriliyor…' : 'Formu indir'}
                            variant="outline"
                            onPress={() => void handleDownloadForm()}
                            disabled={formDownloading}
                            loading={formDownloading}
                          />
                          <FilePickerField
                            label="İmzalı form yükle"
                            value={signedFile}
                            onChange={(f) => void handleUploadSigned(f)}
                            types={[
                              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            ]}
                            helper={signedUploading ? 'Yükleniyor…' : '.xlsx'}
                            disabled={signedUploading}
                          />
                          {activeAssignment.canBeReturned ? (
                            <Button
                              title="Zimmeti iade et"
                              onPress={() => setReturnModalOpen(true)}
                              disabled={returning}
                            />
                          ) : null}
                          {canCancelAssignment(activeAssignment) ? (
                            <Button
                              title="Zimmeti iptal et"
                              variant="destructive"
                              onPress={() => setCancelConfirmVisible(true)}
                              disabled={cancelling}
                            />
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  ) : canManage && canAssign ? (
                    <StockItemAssignmentForm
                      productId={productId}
                      stockItemId={stockItemId}
                      serialLabel={serialLabel}
                      onSuccess={() => void handleRefreshAll()}
                    />
                  ) : !canAssign ? (
                    <View
                      style={{
                        backgroundColor: colors.warningMuted,
                        borderRadius: 12,
                        padding: spacing.md,
                      }}
                    >
                      <Text variant="body">
                        Bu cihaz şu an zimmetlenemez. Depoda ve &quot;Hazır&quot; durumunda olmalıdır.
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {activeTab === 'hareket' && (
                <View style={{ gap: spacing.md }}>
                  {!canManage ? (
                    <Text variant="body">Stok hareketi yetkiniz yok.</Text>
                  ) : (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        padding: spacing.md,
                        gap: spacing.sm,
                      }}
                    >
                      <Text variant="body">
                        {inWarehouse
                          ? 'Bu cihaz depoda. Çıkış kaydı oluşturabilirsiniz.'
                          : 'Bu cihaz depo dışında. Depoya giriş kaydı oluşturabilirsiniz.'}
                      </Text>
                      <Text variant="caption">
                        Lokasyon seçimi mobil MVP&apos;de ertelendi; hareket konum bilgisi olmadan
                        kaydedilir.
                      </Text>
                      {!inWarehouse ? (
                        <Select
                          label="Depo"
                          required
                          options={warehouseOptions}
                          value={selectedWarehouseId}
                          onChange={setSelectedWarehouseId}
                          placeholder="Depo seçin"
                        />
                      ) : null}
                      <TextArea
                        label="Açıklama"
                        value={movementNotes}
                        onChangeText={setMovementNotes}
                        placeholder="Opsiyonel açıklama"
                      />
                      <Button
                        title={movementSubmitting ? 'Kaydediliyor…' : 'Kaydet'}
                        onPress={() => void handleMovementSubmit()}
                        loading={movementSubmitting}
                        fullWidth
                      />
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'gecmis' && (
                <View style={{ gap: spacing.lg }}>
                  <View>
                    <Text variant="h3" style={{ marginBottom: spacing.sm }}>
                      Zimmet geçmişi
                    </Text>
                    {assignments.length === 0 ? (
                      <Text variant="caption">Bu cihaza ait zimmet kaydı yok.</Text>
                    ) : (
                      assignments.map((a) => (
                        <View
                          key={a.id}
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                            paddingVertical: spacing.sm,
                            gap: 2,
                          }}
                        >
                          <Text variant="bodyStrong">
                            {assignmentStatusLabel[a.status] ?? a.status}
                            {' · '}
                            {a.assignedUserName ||
                              a.assignedLocationName ||
                              a.locationName ||
                              '—'}
                          </Text>
                          <Text variant="caption">{formatDate(a.assignmentDate)}</Text>
                          {a.notes ? <Text variant="caption">{a.notes}</Text> : null}
                        </View>
                      ))
                    )}
                  </View>

                  <View>
                    <Text variant="h3" style={{ marginBottom: spacing.sm }}>
                      Stok hareketleri
                    </Text>
                    {movements.length === 0 ? (
                      <Text variant="caption">Bu cihaza ait stok hareketi yok.</Text>
                    ) : (
                      movements.map((m) => (
                        <View
                          key={m.id}
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                            paddingVertical: spacing.sm,
                            gap: 2,
                          }}
                        >
                          <Text variant="bodyStrong">
                            {movementTypeLabel[m.movementType] ?? m.movementType}
                            {' · '}
                            {referenceTypeLabel[m.referenceType ?? ''] ?? m.referenceType ?? '—'}
                          </Text>
                          <Text variant="caption">{formatDate(m.createdAt)}</Text>
                          <Text variant="caption">
                            {[m.parentLocationName, m.childLocationName].filter(Boolean).join(' / ') ||
                              'Lokasyon yok'}
                          </Text>
                          {m.notes ? <Text variant="caption">{m.notes}</Text> : null}
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </BottomSheet>

      <AssignmentReturnModal
        visible={returnModalOpen}
        assignment={activeAssignment ?? null}
        submitting={returning}
        onClose={() => {
          if (!returning) setReturnModalOpen(false);
        }}
        onSubmit={handleReturnAssignment}
      />

      <ConfirmDialog
        visible={cancelConfirmVisible}
        title="Zimmeti iptal et"
        message="Bu zimmeti iptal etmek istediğinize emin misiniz?"
        confirmTitle="İptal et"
        cancelTitle="Vazgeç"
        destructive
        loading={cancelling}
        onConfirm={() => void handleCancelAssignment()}
        onCancel={() => setCancelConfirmVisible(false)}
      />
    </>
  );
}
