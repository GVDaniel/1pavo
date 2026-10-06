import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api';
import { Button, Card, EmptyState, Header, Icon, Input, PriceTag, ProductImage, QuantityStepper, Screen, SummaryRow, Text } from '@/components';
import { useCartSummary } from '@/features/cart/useCartSummary';
import { useValidatePromo } from '@/hooks/queries';
import { useCategoryHue } from '@/hooks/useCategoryHue';
import { useIsGuest } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { CartItem } from '@/types';
import { formatPrice } from '@/utils/format';

export default function Cart() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const summary = useCartSummary();
  const clear = useCartStore((s) => s.clear);
  const removeWhere = useCartStore((s) => s.removeWhere);
  const storeName = useTenantStore((s) => s.storeName);
  const isGuest = useIsGuest();

  if (!summary.items.length) {
    return (
      <Screen>
        <Header title={tr('cart.title')} />
        <EmptyState emoji="🛒" title={tr('cart.emptyTitle')} message={tr('cart.emptyBody')} action={tr('cart.emptyCta')} onAction={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  const checkout = () => {
    if (isGuest) router.push({ pathname: '/auth/login', params: { redirect: '/checkout' } });
    else router.push('/checkout');
  };

  const progress = summary.ready ? Math.min(1, summary.subtotal / summary.config.freeDeliveryThreshold) : 0;

  return (
    <Screen>
      <Header
        title={tr('cart.title')}
        subtitle={tr('cart.preparedBy', { store: storeName })}
        right={
          <Pressable onPress={clear} hitSlop={8} accessibilityRole="button">
            <Text variant="smallStrong" tone="textSecondary" style={{ textDecorationLine: 'underline' }}>
              {tr('cart.clear')}
            </Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: 160, gap: t.spacing.lg }} keyboardShouldPersistTaps="handled">
        {summary.ready && (
          <Card tone="highlight" style={{ gap: t.spacing.sm }}>
            <Text variant="smallStrong">
              {summary.freeDeliveryRemaining > 0
                ? tr('cart.freeDeliveryLeft', { amount: formatPrice(summary.freeDeliveryRemaining) })
                : tr('cart.freeDeliveryReached')}
            </Text>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.surface, overflow: 'hidden' }}>
              <View style={{ height: 8, width: `${progress * 100}%`, backgroundColor: t.colors.ctaStrong, borderRadius: 4 }} />
            </View>
          </Card>
        )}

        {summary.unavailableCount > 0 && (
          <Card tone="accent" style={{ gap: t.spacing.sm }}>
            <Text variant="smallStrong">{tr('cart.unavailable', { count: summary.unavailableCount })}</Text>
            <Button title={tr('cart.removeUnavailable')} size="sm" variant="dark" full={false} onPress={() => removeWhere((i) => !!i.unavailable)} />
          </Card>
        )}

        <View style={{ gap: t.spacing.sm }}>
          {summary.items.map((item) => (
            <CartRow key={item.productId} item={item} />
          ))}
          <Text variant="caption" tone="textMuted" align="center" style={{ marginTop: 4 }}>
            {tr('cart.swipeHint')}
          </Text>
        </View>

        <PromoBox subtotal={summary.subtotal} />

        {summary.ready && (
          <Card style={{ gap: 10 }}>
            <SummaryRow label={tr('summary.subtotal')} value={formatPrice(summary.subtotal)} />
            <SummaryRow label={tr('summary.delivery')} value={summary.deliveryFee ? formatPrice(summary.deliveryFee) : tr('summary.free')} />
            <SummaryRow label={tr('summary.service')} value={formatPrice(summary.serviceFee)} />
            {summary.discount > 0 && <SummaryRow label={tr('summary.discount')} value={`-${formatPrice(summary.discount)}`} accent />}
            <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: 4 }} />
            <SummaryRow label={tr('summary.total')} value={formatPrice(summary.total)} strong />
          </Card>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: t.spacing.lg, paddingBottom: Math.max(insets.bottom, t.spacing.lg), backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border, gap: t.spacing.sm }}>
        {summary.ready && !summary.meetsMinimum && (
          <Text variant="smallStrong" tone="accent" align="center">
            {tr('cart.minOrder', { amount: formatPrice(summary.config.minOrder - summary.subtotal), min: formatPrice(summary.config.minOrder) })}
          </Text>
        )}
        <Button
          size="lg"
          title={summary.ready ? tr('cart.checkout', { total: formatPrice(summary.total) }) : tr('cart.checkoutPlain')}
          disabled={!summary.ready || !summary.meetsMinimum}
          onPress={checkout}
        />
      </View>
    </Screen>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const hue = useCategoryHue(item.product.categoryId);
  const inc = useCartStore((s) => s.increment);
  const dec = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);

  return (
    <Animated.View layout={LinearTransition} exiting={FadeOut}>
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={60}
        onSwipeableOpen={() => remove(item.productId)}
        renderRightActions={() => (
          <View style={{ width: 96, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.error, borderRadius: t.radius.lg, marginLeft: t.spacing.sm }}>
            <Icon name="trash-outline" size={22} color="#fff" />
          </View>
        )}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, backgroundColor: t.colors.surface, borderRadius: t.radius.lg, padding: t.spacing.sm, opacity: item.unavailable ? 0.5 : 1 }}>
          <Pressable onPress={() => router.push(`/product/${item.productId}`)}>
            <ProductImage emoji={item.product.emoji} hue={hue} image={item.product.image} height={64} width={64} radius={t.radius.md} />
          </Pressable>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="smallStrong" numberOfLines={2}>
              {item.product.name}
            </Text>
            <Text variant="caption" tone="textMuted">
              {item.unavailable ? tr('cart.notInStore') : item.product.format}
            </Text>
            {!item.unavailable && <PriceTag price={item.product.price * item.quantity} size="sm" tilt={false} />}
          </View>
          {!item.unavailable && (
            <QuantityStepper size="sm" value={item.quantity} max={item.product.stock} onIncrement={() => inc(item.productId)} onDecrement={() => dec(item.productId)} />
          )}
        </View>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

function PromoBox({ subtotal }: { subtotal: number }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const promo = useCartStore((s) => s.promo);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const removePromo = useCartStore((s) => s.removePromo);
  const validate = useValidatePromo();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  if (promo) {
    return (
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <Icon name="pricetag" size={20} color={t.colors.accent} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{promo.code}</Text>
          <Text variant="caption" tone="textSecondary">
            {subtotal >= promo.minOrder ? promo.title : tr('cart.promoMin', { amount: formatPrice(promo.minOrder) })}
          </Text>
        </View>
        <Pressable onPress={removePromo} hitSlop={8} accessibilityLabel={tr('cart.removePromo')}>
          <Icon name="close-circle" size={22} color={t.colors.textMuted} />
        </Pressable>
      </Card>
    );
  }

  const submit = async () => {
    setError(undefined);
    try {
      const p = await validate.mutateAsync({ code, subtotal });
      applyPromo(p);
      toast(tr('cart.promoApplied', { code: p.code }), 'success');
      setCode('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : tr('errors.generic'));
    }
  };

  return (
    <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'flex-start' }}>
      <View style={{ flex: 1 }}>
        <Input value={code} onChangeText={(v) => setCode(v.toUpperCase())} placeholder={tr('cart.promoPlaceholder')} icon="pricetag-outline" autoCapitalize="characters" error={error} />
      </View>
      <Button title={tr('cart.apply')} variant="secondary" full={false} disabled={!code} loading={validate.isPending} onPress={submit} />
    </View>
  );
}
