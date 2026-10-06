import React from 'react';
import { Pressable } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useCartQuantity, useCartStore } from '@/store/cartStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { StoreProduct } from '@/types';
import { hapticImpact } from '@/utils/haptics';
import { Icon } from './Icon';
import { QuantityStepper } from './QuantityStepper';

/** Botón "+" que se transforma en contador al añadir */
export function AddToCart({ product, size = 'sm' }: { product: StoreProduct; size?: 'sm' | 'md' }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const qty = useCartQuantity(product.id);
  const add = useCartStore((s) => s.add);
  const inc = useCartStore((s) => s.increment);
  const dec = useCartStore((s) => s.decrement);
  const d = size === 'sm' ? 36 : 44;

  if (!product.available) return null;

  if (qty === 0) {
    return (
      <Animated.View key="add" entering={ZoomIn.duration(160)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr('product.addNamed', { name: product.name })}
          hitSlop={6}
          onPress={() => {
            hapticImpact();
            add(product);
            if (product.ageRestricted) toast(tr('cart.ageNotice'));
          }}
          style={({ pressed }) => [
            {
              width: d,
              height: d,
              borderRadius: d / 2,
              backgroundColor: t.colors.ctaStrong,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            },
            t.shadow.md,
          ]}
        >
          <Icon name="add" size={d * 0.58} color={t.colors.ctaStrongText} />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View key="stepper" entering={ZoomIn.duration(180)}>
      <QuantityStepper
        size="sm"
        value={qty}
        max={product.stock}
        onIncrement={() => inc(product.id)}
        onDecrement={() => dec(product.id)}
      />
    </Animated.View>
  );
}
