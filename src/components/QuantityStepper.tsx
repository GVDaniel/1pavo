import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { hapticImpact } from '@/utils/haptics';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  /** Muestra papelera cuando la cantidad es 1 */
  trashAtOne?: boolean;
};

export function QuantityStepper({ value, onIncrement, onDecrement, max, size = 'md', trashAtOne = true }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const h = { sm: 34, md: 40, lg: 52 }[size];
  const atMax = max !== undefined && value >= max;
  const btn = (icon: 'add' | 'remove' | 'trash-outline', onPress: () => void, label: string, disabled = false) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={4}
      onPress={() => {
        hapticImpact();
        onPress();
      }}
      style={{ width: h, height: h, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 }}
    >
      <Icon name={icon} size={h * 0.45} color={t.colors.ctaStrongText} />
    </Pressable>
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.colors.ctaStrong,
        borderRadius: t.radius.pill,
        height: h,
      }}
    >
      {btn(value === 1 && trashAtOne ? 'trash-outline' : 'remove', onDecrement, tr('cart.decrease'))}
      <Text
        variant={size === 'lg' ? 'button' : 'smallStrong'}
        color={t.colors.ctaStrongText}
        style={{ minWidth: 18, textAlign: 'center' }}
        accessibilityLiveRegion="polite"
      >
        {value}
      </Text>
      {btn('add', onIncrement, tr('cart.increase'), atMax)}
    </View>
  );
}
