import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useCartSummary } from '@/features/cart/useCartSummary';
import { useCartCount } from '@/store/cartStore';
import { useTheme } from '@/theme/ThemeProvider';
import { formatPrice } from '@/utils/format';
import { Icon } from './Icon';
import { Text } from './Text';

/** Mini-cesta flotante; "salta" cada vez que cambia el número de productos */
export function FloatingCartBar() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const count = useCartCount();
  const summary = useCartSummary();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0) scale.value = withSequence(withSpring(1.05, { damping: 8 }), withSpring(1, { damping: 12 }));
  }, [count, scale]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  if (!count) return null;

  const remaining = summary.ready ? summary.freeDeliveryRemaining : 0;
  const fg = t.colors.ctaStrongText;

  return (
    <Animated.View entering={FadeInDown.springify().damping(16)} exiting={FadeOutDown} style={[{ paddingHorizontal: t.spacing.lg, marginBottom: t.spacing.sm }, anim]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tr('cart.viewA11y', { count, total: formatPrice(summary.subtotal) })}
        onPress={() => router.push('/cart')}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.spacing.md,
            backgroundColor: t.colors.ctaStrong,
            borderRadius: t.radius.pill,
            paddingVertical: 10,
            paddingLeft: 10,
            paddingRight: t.spacing.xl,
          },
          t.shadow.lg,
        ]}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.cta, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bag-handle" size={19} color={t.colors.ctaText} />
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              paddingHorizontal: 4,
              backgroundColor: t.colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="caption" color={t.colors.accentText} style={{ fontFamily: t.fonts.bodyBold }}>
              {count}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong" color={fg}>
            {tr('cart.view')}
          </Text>
          <Text variant="caption" color={fg} style={{ opacity: 0.7 }} numberOfLines={1}>
            {remaining > 0 ? tr('cart.freeDeliveryLeft', { amount: formatPrice(remaining) }) : tr('cart.freeDeliveryReached')}
          </Text>
        </View>
        <Text variant="h3" color={fg}>
          {formatPrice(summary.subtotal)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
