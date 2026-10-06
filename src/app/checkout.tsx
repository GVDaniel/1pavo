import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api';
import { Button, Card, Checkbox, Chip, Header, Icon, Input, RadioRow, Screen, SummaryRow, Text } from '@/components';
import { useCartSummary } from '@/features/cart/useCartSummary';
import { useCreateOrder, usePaymentMethods } from '@/hooks/queries';
import { useCartStore } from '@/store/cartStore';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { PaymentMethodType } from '@/types';
import { formatPrice, formatTime } from '@/utils/format';
import { hapticSuccess } from '@/utils/haptics';
import { buildSlots, canSellAlcohol } from '@/utils/time';

const TIPS = [0, 1, 2, 3];
const WALLETS: { id: PaymentMethodType; icon: 'logo-apple' | 'logo-google' | 'phone-portrait-outline' }[] = [
  { id: 'apple_pay', icon: 'logo-apple' },
  { id: 'google_pay', icon: 'logo-google' },
  { id: 'bizum', icon: 'phone-portrait-outline' },
];

export default function Checkout() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const address = useTenantStore((s) => s.deliveryAddress);
  const payments = usePaymentMethods();
  const createOrder = useCreateOrder();
  const clearCart = useCartStore((s) => s.clear);
  const removeWhere = useCartStore((s) => s.removeWhere);

  const [tip, setTip] = useState(1);
  const summary = useCartSummary(tip);
  const [instructions, setInstructions] = useState('');
  const [when, setWhen] = useState<string>('asap');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [ageOk, setAgeOk] = useState(false);
  const slots = useMemo(() => buildSlots(8), []);

  const cards = payments.data ?? [];
  const selectedPayment = paymentId ?? cards.find((c) => c.isDefault)?.id ?? cards[0]?.id ?? 'apple_pay';

  if (!summary.ready || !address) {
    return (
      <Screen>
        <Header title={tr('checkout.title')} />
      </Screen>
    );
  }

  const config = summary.config;
  const whenDate = when === 'asap' ? new Date() : new Date(when);
  const alcoholAllowed = canSellAlcohol(config.alcohol, whenDate);
  const alcoholBlocked = summary.hasAlcohol && !alcoholAllowed;
  const needsAge = summary.hasAlcohol && alcoholAllowed;
  const allowedWallets = WALLETS.filter((w) => config.paymentMethods.includes(w.id));

  const canPay = !alcoholBlocked && (!needsAge || ageOk) && summary.meetsMinimum && !createOrder.isPending;

  const place = async () => {
    try {
      const order = await createOrder.mutateAsync({
        items: summary.items.filter((i) => !i.unavailable).map((i) => ({ productId: i.productId, quantity: i.quantity })),
        address,
        instructions: instructions || undefined,
        paymentMethodId: selectedPayment,
        tip,
        promoCode: summary.promoValid ? summary.promo?.code : undefined,
        scheduledFor: when === 'asap' ? undefined : when,
        ageVerified: ageOk,
      });
      hapticSuccess();
      clearCart();
      router.dismissAll();
      router.replace({ pathname: '/order-success', params: { id: order.id } });
    } catch (e) {
      toast(e instanceof ApiError ? e.message : tr('errors.generic'), 'error');
    }
  };

  const mapRegion = { ...address.location, latitudeDelta: 0.006, longitudeDelta: 0.006 };

  return (
    <Screen>
      <Header title={tr('checkout.title')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: 150, gap: t.spacing.xxl }} keyboardShouldPersistTaps="handled">
        {/* Dirección */}
        <View style={{ gap: t.spacing.md }}>
          <Text variant="h3">{tr('checkout.address')}</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <MapView style={{ height: 130 }} region={mapRegion} scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false} pointerEvents="none">
              <Marker coordinate={address.location} />
            </MapView>
            <Pressable onPress={() => router.push('/account/addresses')} style={{ flexDirection: 'row', alignItems: 'center', padding: t.spacing.lg, gap: t.spacing.md }}>
              <Icon name="location" size={20} color={t.colors.textPrimary} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{address.label}</Text>
                <Text variant="small" tone="textSecondary">
                  {address.street}
                </Text>
              </View>
              <Text variant="smallStrong" style={{ textDecorationLine: 'underline' }}>
                {tr('checkout.change')}
              </Text>
            </Pressable>
          </Card>
          <Input value={instructions} onChangeText={setInstructions} placeholder={tr('checkout.instructionsPlaceholder')} icon="chatbubble-outline" multiline />
        </View>

        {/* Cuándo */}
        <View style={{ gap: t.spacing.md }}>
          <Text variant="h3">{tr('checkout.when')}</Text>
          <RadioRow icon="flash-outline" title={tr('checkout.asap')} subtitle={tr('checkout.asapSub', { min: config.etaMin, max: config.etaMax })} selected={when === 'asap'} onPress={() => setWhen('asap')} />
          {config.features.scheduledOrders && (
            <>
              <RadioRow icon="calendar-outline" title={tr('checkout.schedule')} subtitle={when !== 'asap' ? formatTime(when) : tr('checkout.scheduleSub')} selected={when !== 'asap'} onPress={() => setWhen(slots[0].toISOString())} />
              {when !== 'asap' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing.sm }}>
                  {slots.map((s) => (
                    <Chip key={s.toISOString()} label={formatTime(s)} selected={when === s.toISOString()} onPress={() => setWhen(s.toISOString())} />
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>

        {/* Pago */}
        <View style={{ gap: t.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h3">{tr('checkout.payment')}</Text>
            <Pressable onPress={() => router.push('/account/payments')} hitSlop={8}>
              <Text variant="smallStrong" style={{ textDecorationLine: 'underline' }}>
                {tr('checkout.addCard')}
              </Text>
            </Pressable>
          </View>
          {cards.map((c) => (
            <RadioRow key={c.id} icon="card-outline" title={`${c.label} ···· ${c.last4}`} subtitle={tr('checkout.expires', { date: c.expiry })} selected={selectedPayment === c.id} onPress={() => setPaymentId(c.id)} />
          ))}
          {allowedWallets.map((w) => (
            <RadioRow key={w.id} icon={w.icon} title={tr(`payments.${w.id}`)} selected={selectedPayment === w.id} onPress={() => setPaymentId(w.id)} />
          ))}
        </View>

        {/* Propina */}
        {config.features.tips && (
          <View style={{ gap: t.spacing.md }}>
            <View>
              <Text variant="h3">{tr('checkout.tip')}</Text>
              <Text variant="small" tone="textSecondary">
                {tr('checkout.tipSub')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
              {TIPS.map((v) => (
                <Chip key={v} label={v ? formatPrice(v) : tr('checkout.noTip')} selected={tip === v} onPress={() => setTip(v)} />
              ))}
            </View>
          </View>
        )}

        {/* Alcohol y edad */}
        {alcoholBlocked && (
          <Card tone="accent" style={{ gap: t.spacing.md }}>
            <Text variant="bodyStrong">{tr('checkout.alcoholBlockedTitle')}</Text>
            <Text variant="small">{tr('checkout.alcoholBlockedBody', { from: config.alcohol.allowedFrom, to: config.alcohol.allowedTo })}</Text>
            <Button title={tr('checkout.removeAlcohol')} variant="dark" size="sm" full={false} onPress={() => removeWhere((i) => i.product.ageRestricted)} />
          </Card>
        )}
        {needsAge && (
          <Card tone="highlight">
            <Checkbox checked={ageOk} onChange={setAgeOk} label={tr('checkout.ageConfirm', { age: config.alcohol.minAge })} />
          </Card>
        )}

        {/* Resumen */}
        <Card style={{ gap: 10 }}>
          <SummaryRow label={tr('summary.subtotal')} value={formatPrice(summary.subtotal)} />
          <SummaryRow label={tr('summary.delivery')} value={summary.deliveryFee ? formatPrice(summary.deliveryFee) : tr('summary.free')} />
          <SummaryRow label={tr('summary.service')} value={formatPrice(summary.serviceFee)} />
          {summary.discount > 0 && <SummaryRow label={tr('summary.discount')} value={`-${formatPrice(summary.discount)}`} accent />}
          {summary.tip > 0 && <SummaryRow label={tr('summary.tip')} value={formatPrice(summary.tip)} />}
          <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: 4 }} />
          <SummaryRow label={tr('summary.total')} value={formatPrice(summary.total)} strong />
        </Card>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: t.spacing.lg, paddingBottom: Math.max(insets.bottom, t.spacing.lg), backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border }}>
        <Button size="lg" title={tr('checkout.pay', { total: formatPrice(summary.total) })} disabled={!canPay} loading={createOrder.isPending} onPress={place} icon="lock-closed" />
      </View>
    </Screen>
  );
}
