import React from 'react';
import { Pressable, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { RequestList } from '@/components/requests/RequestList';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import { purchaseService } from '@/services/api/purchase.service';

export default function MyRequestsScreen() {
  const router = useRouter();
  const { canCreateRequest } = useCapabilities();
  const { colors, spacing, radius, shadow, zIndex } = useAppTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Taleplerim',
        }}
      />
      <View style={{ flex: 1 }}>
        <RequestList
          listKey="my"
          fetchFunction={purchaseService.getMyRequests.bind(purchaseService)}
          onNav={(id) => router.push(`/request-detail/${id}`)}
          onEdit={(id) => router.push(`/edit-request/${id}`)}
        />
        {canCreateRequest ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Yeni talep oluştur"
            onPress={() => router.push('/create-request')}
            style={({ pressed }) => ({
              position: 'absolute',
              right: spacing.lg,
              bottom: spacing.lg,
              width: 56,
              height: 56,
              borderRadius: radius.full,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
              zIndex: zIndex.sticky,
              ...shadow.md,
            })}
          >
            <Ionicons name="add" size={28} color={colors.textInverse} />
          </Pressable>
        ) : null}
      </View>
    </>
  );
}
