import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Badge, BadgeTone, Button, Card, EmptyState, ErrorState, Segmented, Skeleton, TAB_BAR_SPACE, Text } from '@/components';
import { useRepeatOrder } from '@/features/orders/useRepeatOrder';
import { useOrders } from '@/hooks/queries';
import { useIsGuest } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { Order, OrderStatus } from '@/types';
import { formatDate, formatPrice, formatTime } from '@/utils/format';

const TONE: Record<OrderStatus, BadgeTone> = {
  received: 'sun',
  preparing: 'sun',
  on_the_way: 'accent',
  delivered: 'success',
  cancelled: 'muted',
};

export default function Orders() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const isGuest = useIsGuest();
  const { data, isLoading, isError, refetch, isRefetching } = useOrders();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const active = data?.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled') ?? [];
  const history = data?.filter((o) => o.status === 'delivered' || o.status === 'cancelled') ?? [];
  const list = tab === 'active' ? active : history;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md, gap: t.spacing.lg, paddingBottom: t.spacing.md }}>
        <Text variant="h1">{tr('orders.title')}</Text>
        {!isGuest && (
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { key: 'active', label: tr('orders.active', { count: active.length }) },
              { key: 'history', label: tr('orders.history') },
            ]}
          />
        )}
      </View>

      {isGuest ? (
        <EmptyState emoji="🧾" title={tr('orders.guestTitle')} message={tr('orders.guestBody')} action={tr('orders.login')} onAction={() => router.push('/auth/login')} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <View style={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={150} radius={t.radius.lg} />
          ))}
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md, paddingBottom: TAB_BAR_SPACE }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={t.colors.textMuted} />}
          ListEmptyComponent={
            tab === 'active' ? (
              <EmptyState emoji="🛵" title={tr('orders.emptyActiveTitle')} message={tr('orders.emptyActiveBody')} action={tr('orders.startShopping')} onAction={() => router.push('/')} />
            ) : (
              <EmptyState emoji="🧾" title={tr('orders.emptyHistoryTitle')} />
            )
          }
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function OrderCard({ order }: { order: Order }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const repeat = useRepeatOrder();
  const live = order.status !== 'delivered' && order.status !== 'cancelled';
  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Pressable onPress={() => router.push(live ? `/tracking/${order.id}` : `/order/${order.id}`)} accessibilityRole="button">
      <Card style={{ gap: t.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
          <View style={{ flexDirection: 'row' }}>
            {order.items.slice(0, 3).map((i, idx) => (
              <View
                key={i.productId}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: t.colors.surfaceAlt,
                  borderWidth: 2,
                  borderColor: t.colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: idx ? -12 : 0,
                }}
              >
                <Text style={{ fontSize: 20, lineHeight: 26 }}>{i.emoji}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{order.storeName}</Text>
            <Text variant="caption" tone="textSecondary">
              {tr('orders.meta', { date: formatDate(order.createdAt), time: formatTime(order.createdAt), count })}
            </Text>
          </View>
          <Badge tone={TONE[order.status]} label={tr(`orderStatusShort.${order.status}`)} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="h3">{formatPrice(order.totals.total)}</Text>
          <Text variant="caption" tone="textMuted">
            {order.code}
          </Text>
        </View>

        {live ? (
          <Button title={tr('orders.track')} icon="navigate" variant="dark" size="sm" onPress={() => router.push(`/tracking/${order.id}`)} />
        ) : (
          <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
            {order.status === 'delivered' && (
              <Button title={tr('orders.repeat')} icon="refresh" variant="primary" size="sm" full={false} style={{ flex: 1 }} onPress={() => repeat(order)} />
            )}
            {order.status === 'delivered' && !order.rating ? (
              <Button title={tr('orders.rate')} icon="star-outline" variant="secondary" size="sm" full={false} style={{ flex: 1 }} onPress={() => router.push(`/rate/${order.id}`)} />
            ) : (
              <Button title={tr('orders.detail')} variant="secondary" size="sm" full={false} style={{ flex: 1 }} onPress={() => router.push(`/order/${order.id}`)} />
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
}
