import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Card, ErrorState, goBack, Icon, IconButton, OrderStepper, Skeleton, Text } from '@/components';
import { useOrder } from '@/hooks/queries';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { formatPrice, formatTime } from '@/utils/format';
import { regionFor } from '@/utils/geo';

function Pin({ emoji, bg }: { emoji: string; bg: string }) {
  return (
    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' }}>
      <Text style={{ fontSize: 20, lineHeight: 26 }}>{emoji}</Text>
    </View>
  );
}

export default function Tracking() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isError, refetch } = useOrder(id, true);
  const [showItems, setShowItems] = useState(false);

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.background, paddingTop: insets.top + 40 }}>
        <ErrorState onRetry={refetch} />
      </View>
    );
  }

  const courierLoc = order?.courier?.location;
  const region = order ? regionFor([order.storeLocation, order.address.location], 2.2) : undefined;
  const delivered = order?.status === 'delivered';

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ height: height * 0.46 }}>
        {region ? (
          <MapView style={{ flex: 1 }} initialRegion={region} userInterfaceStyle={t.isDark ? 'dark' : 'light'}>
            <Polyline coordinates={[order!.storeLocation, order!.address.location]} strokeColor={t.colors.textPrimary} strokeWidth={3} lineDashPattern={[6, 6]} />
            <Marker coordinate={order!.storeLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <Pin emoji="🏪" bg={t.colors.cta} />
            </Marker>
            <Marker coordinate={order!.address.location} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <Pin emoji="🏠" bg="#141726" />
            </Marker>
            {courierLoc && order?.status === 'on_the_way' && (
              <Marker coordinate={courierLoc} anchor={{ x: 0.5, y: 0.5 }}>
                <Pin emoji={order.courier?.vehicle === 'bici' ? '🚲' : order.courier?.vehicle === 'patinete' ? '🛴' : '🛵'} bg={t.colors.mapCourier} />
              </Marker>
            )}
          </MapView>
        ) : (
          <Skeleton height="100%" radius={0} />
        )}
        <IconButton icon="chevron-back" variant="glass" accessibilityLabel={tr('common.back')} onPress={() => (router.canGoBack() ? goBack() : router.replace('/(tabs)'))} style={{ position: 'absolute', top: insets.top + 8, left: t.spacing.lg }} />
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: -24, borderTopLeftRadius: t.radius.xl, borderTopRightRadius: t.radius.xl, backgroundColor: t.colors.background }}
        contentContainerStyle={{ padding: t.spacing.xl, paddingBottom: insets.bottom + 32, gap: t.spacing.xl }}
      >
        {!order ? (
          <View style={{ gap: t.spacing.md }}>
            <Skeleton width="70%" height={30} />
            <Skeleton width="40%" height={16} />
            <Skeleton height={70} />
          </View>
        ) : (
          <>
            <View style={{ gap: 4 }}>
              <Text variant="h1" accessibilityLiveRegion="polite">
                {tr(`orderStatus.${order.status}`)}
              </Text>
              <Text tone="textSecondary">
                {delivered
                  ? tr('tracking.deliveredAt', { time: formatTime(order.deliveredAt ?? order.etaAt) })
                  : tr('tracking.eta', { time: formatTime(order.etaAt) })}
              </Text>
            </View>

            <OrderStepper status={order.status} />

            {order.deliveryCode && !delivered ? (
              <Card style={{ alignItems: 'center', gap: 4 }}>
                <Text variant="small" tone="textMuted">
                  {tr('success.deliveryCode')}
                </Text>
                <Text variant="h1">{order.deliveryCode}</Text>
                <Text variant="small" tone="textSecondary" align="center">
                  {tr('success.deliveryCodeHint')}
                </Text>
              </Card>
            ) : null}

            {order.courier && (order.status === 'on_the_way' || delivered) && (
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <Avatar first={order.courier.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{order.courier.name}</Text>
                  <Text variant="caption" tone="textSecondary">
                    {tr('tracking.courier', { vehicle: tr(`vehicle.${order.courier.vehicle}`), rating: order.courier.rating })}
                  </Text>
                </View>
                <IconButton icon="chatbubble-ellipses-outline" accessibilityLabel={tr('tracking.chat')} variant="plain" onPress={() => router.push('/account/chat')} />
                <IconButton icon="call-outline" accessibilityLabel={tr('tracking.call')} variant="plain" onPress={() => toast(tr('tracking.callMock', { phone: order.courier?.phone }))} />
              </Card>
            )}

            {delivered && !order.rating && <Button title={tr('tracking.rate')} icon="star" onPress={() => router.replace(`/rate/${order.id}`)} size="lg" />}

            <Card style={{ gap: t.spacing.md }}>
              <View style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'center' }}>
                <Icon name="storefront-outline" size={20} color={t.colors.textSecondary} />
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  {order.storeName}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'center' }}>
                <Icon name="location-outline" size={20} color={t.colors.textSecondary} />
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  {order.address.street}
                </Text>
              </View>
              <Pressable onPress={() => setShowItems((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} accessibilityRole="button" accessibilityState={{ expanded: showItems }}>
                <Text variant="bodyStrong">{tr('tracking.items', { count: order.items.reduce((n, i) => n + i.quantity, 0), total: formatPrice(order.totals.total) })}</Text>
                <Icon name={showItems ? 'chevron-up' : 'chevron-down'} size={18} color={t.colors.textSecondary} />
              </Pressable>
              {showItems &&
                order.items.map((i) => (
                  <View key={i.productId} style={{ flexDirection: 'row', gap: t.spacing.sm }}>
                    <Text>{i.emoji}</Text>
                    <Text variant="small" style={{ flex: 1 }}>
                      {`${i.quantity} × ${i.name}`}
                    </Text>
                    <Text variant="smallStrong">{formatPrice(i.unitPrice * i.quantity)}</Text>
                  </View>
                ))}
            </Card>

            <Button title={tr('tracking.help')} variant="ghost" icon="help-circle-outline" onPress={() => router.push('/account/help')} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
