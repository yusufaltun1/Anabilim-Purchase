import { AccessDenied } from '@/components/auth/AccessDenied';
import { PurchaseRequestForm } from '@/components/forms/PurchaseRequestForm';
import { PurchaseRequestItemsForm } from '@/components/forms/PurchaseRequestItemsForm';
import { Screen, ScreenHeader, Loading, EmptyState } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { canEditRequest } from '@/domain/requests/approvalRules';
import { useCapabilities } from '@/hooks/useCapabilities';
import { purchaseService } from '@/services/api/purchase.service';
import type { PurchaseRequest } from '@/services/types/purchase.types';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';

export default function EditRequestScreen() {
  const { id } = useLocalSearchParams();
  const { token, user } = useAuth();
  const { hasCapability } = useCapabilities();
  const canEditCapability = hasCapability('REQUEST_EDIT');
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const isPurchasingEditor = useMemo(() => {
    const roles = user?.roles ?? [];
    return roles.includes('SATIN_ALMA_DEPARTMANI') || roles.includes('PURCHASE_MANAGER');
  }, [user?.roles]);

  useEffect(() => {
    if (!id || !token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await purchaseService.getRequestById(Number(id), token);
        if (!cancelled) setRequest(data);
      } catch (error) {
        console.error('Failed to fetch request:', error);
        if (!cancelled) setRequest(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Talep Güncelle', headerShown: false }} />
        <Loading fullScreen label="Yükleniyor…" />
      </>
    );
  }

  if (!request) {
    return (
      <>
        <Stack.Screen options={{ title: 'Talep Güncelle', headerShown: false }} />
        <Screen>
          <EmptyState
            title="Talep bulunamadı"
            description="Bu talep mevcut değil veya erişim yetkiniz yok."
            icon="document-text-outline"
            actionTitle="Geri dön"
            onAction={() => router.back()}
          />
        </Screen>
      </>
    );
  }

  const isRequester = request.requester?.id === user?.id;

  // Satın alma editörü: REQUEST_EDIT + canEditRequest kuralları
  // Talep sahibi yolu: REJECTED+owner VEYA canEditRequest
  const allowed = isPurchasingEditor
    ? canEditRequest(request, canEditCapability)
    : (request.status === 'REJECTED' && isRequester) || canEditRequest(request, canEditCapability);

  if (!allowed) {
    return (
      <>
        <Stack.Screen options={{ title: 'Talep Güncelle', headerShown: false }} />
        <AccessDenied description="Bu talep düzenlenemez veya yetkiniz yok." />
      </>
    );
  }

  const requestId = Number(id);

  return (
    <>
      <Stack.Screen options={{ title: 'Talep Güncelle', headerShown: false }} />
      <Screen padded edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Talep güncelle" subtitle={request.title} />
        {isPurchasingEditor && canEditCapability ? (
          <PurchaseRequestItemsForm
            requestId={requestId}
            initialData={request}
            onSuccess={() => router.back()}
            onCancel={() => router.back()}
          />
        ) : (
          <PurchaseRequestForm
            onSuccess={() => router.back()}
            onCancel={() => router.back()}
            initialData={request}
            requestId={requestId}
          />
        )}
      </Screen>
    </>
  );
}
