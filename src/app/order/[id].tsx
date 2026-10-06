import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, ErrorState, Header, Rating, Screen, Skeleton, SummaryRow, Text } from '@/components';
import { useRepeatOrder } from '@/features/orders/useRepeatOrder';
import { useOrder } from '@/hooks/queries';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDate, formatPrice, formatTime } from '@/utils/format';

export default function OrderDetail() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: o, isError, refetch } = useOrder(id);
  const repeat = useRepeatOrder();

  return (
    <Screen>
      <Header title={o ? tr('orderDetail.title', { code: o.code }) : ''} subtitle={o ? `${formatDate(o.createdAt)}, ${formatTime(o.createdAt)}` : undefined} />
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : !o ? (
        <View style={{ padding: t.spacing.lg, gap: t.spacing.md }}>
          <Skeleton height={120} />
          <Skeleton height={160} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: 48, gap: t.spacing.lg }}>
          <Badge tone={o.status === 'delivered' ? 'success' : 'muted'} label={tr(`orderStatusShort.${o.status}`)} />

          <Card style={{ gap: t.spacing.md }}>
            <Text variant="h3">{tr('orderDetail.items')}</Text>
            {o.items.map((i) => (
              <View key={i.productId} style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20, lineHeight: 26 }}>{i.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="smallStrong">{`${i.quantity} × ${i.name}`}</Text>
                  <Text variant="caption" tone="textMuted">
                    {i.format}
                  </Text>
                </View>
                <Text variant="smallStrong">{formatPrice(i.unitPrice * i.quantity)}</Text>
              </View>
            ))}
          </Card>

          <Card style={{ gap: 10 }}>
            <SummaryRow label={tr('summary.subtotal')} value={formatPrice(o.totals.subtotal)} />
            <SummaryRow label={tr('summary.delivery')} value={o.totals.deliveryFee ? formatPrice(o.totals.deliveryFee) : tr('summary.free')} />
            <SummaryRow label={tr('summary.service')} value={formatPrice(o.totals.serviceFee)} />
            {o.totals.discount > 0 && <SummaryRow label={tr('summary.discount')} value={`-${formatPrice(o.totals.discount)}`} accent />}
            {o.totals.tip > 0 && <SummaryRow label={tr('summary.tip')} value={formatPrice(o.totals.tip)} />}
            <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: 4 }} />
            <SummaryRow label={tr('summary.total')} value={formatPrice(o.totals.total)} strong />
          </Card>

          <Card style={{ gap: t.spacing.sm }}>
            <Text variant="smallStrong" tone="textSecondary">
              {tr('orderDetail.deliveredTo')}
            </Text>
            <Text variant="bodyMedium">{o.address.street}</Text>
            <Text variant="smallStrong" tone="textSecondary" style={{ marginTop: t.spacing.sm }}>
              {tr('orderDetail.paidWith')}
            </Text>
            <Text variant="bodyMedium">{o.paymentLabel}</Text>
            <Text variant="smallStrong" tone="textSecondary" style={{ marginTop: t.spacing.sm }}>
              {tr('orderDetail.store')}
            </Text>
            <Text variant="bodyMedium">{o.storeName}</Text>
          </Card>

          {o.rating && (
            <Card style={{ gap: t.spacing.sm }}>
              <Text variant="smallStrong" tone="textSecondary">
                {tr('orderDetail.yourRating')}
              </Text>
              <Rating value={o.rating.delivery} size={22} />
              {!!o.rating.comment && <Text tone="textSecondary">{o.rating.comment}</Text>}
            </Card>
          )}

          <View style={{ gap: t.spacing.sm }}>
            {o.status === 'delivered' && <Button title={tr('orders.repeat')} icon="refresh" onPress={() => repeat(o)} />}
            {o.status === 'delivered' && !o.rating && <Button title={tr('orders.rate')} icon="star-outline" variant="secondary" onPress={() => router.push(`/rate/${o.id}`)} />}
            <Button title={tr('orderDetail.invoice')} icon="download-outline" variant="secondary" onPress={() => toast(tr('orderDetail.invoiceSent'), 'success')} />
            <Button title={tr('orderDetail.help')} icon="help-circle-outline" variant="ghost" onPress={() => router.push('/account/help')} />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
