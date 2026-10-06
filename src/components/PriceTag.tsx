import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { formatPrice, splitPrice } from '@/utils/format';
import { Text } from './Text';

const SIZES = {
  sm: { int: 17, dec: 10, padH: 7, padV: 3, hole: 4 },
  md: { int: 23, dec: 12, padH: 9, padV: 4, hole: 5 },
  lg: { int: 38, dec: 17, padH: 13, padV: 6, hole: 7 },
};

/**
 * Etiqueta de precio tipo pegatina de tienda: el elemento de marca de 1pavo.
 * Amarilla por defecto, rosa neón si hay oferta. Ligeramente girada.
 */
export function PriceTag({
  price,
  oldPrice,
  size = 'md',
  tilt = true,
}: {
  price: number;
  oldPrice?: number;
  size?: keyof typeof SIZES;
  tilt?: boolean;
}) {
  const t = useTheme();
  const { int, dec } = splitPrice(price);
  const sz = SIZES[size];
  const onSale = !!oldPrice && oldPrice > price;
  const bg = onSale ? t.colors.accent : t.colors.priceTag;
  const fg = onSale ? t.colors.accentText : t.colors.priceTagText;

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
      accessible
      accessibilityLabel={onSale ? `${formatPrice(price)}, antes ${formatPrice(oldPrice!)}` : formatPrice(price)}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: bg,
          paddingLeft: sz.padH + sz.hole + 3,
          paddingRight: sz.padH,
          paddingVertical: sz.padV,
          borderRadius: 7,
          borderTopLeftRadius: sz.int,
          borderBottomLeftRadius: sz.int,
          transform: [{ rotate: tilt ? '-3deg' : '0deg' }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: sz.padH - 1,
            top: '50%',
            marginTop: -sz.hole / 2,
            width: sz.hole,
            height: sz.hole,
            borderRadius: sz.hole,
            backgroundColor: t.colors.surface,
          }}
        />
        <Text style={{ fontFamily: t.fonts.display, fontSize: sz.int, lineHeight: sz.int * 1.08, color: fg }}>
          {int}
        </Text>
        <View style={{ marginLeft: 1, paddingTop: sz.int * 0.08 }}>
          <Text style={{ fontFamily: t.fonts.displayBold, fontSize: sz.dec, lineHeight: sz.dec * 1.05, color: fg }}>
            ,{dec}
          </Text>
          <Text style={{ fontFamily: t.fonts.displayBold, fontSize: sz.dec * 0.85, lineHeight: sz.dec, color: fg }}>
            €
          </Text>
        </View>
      </View>
      {onSale && (
        <Text variant="caption" tone="textMuted" style={{ textDecorationLine: 'line-through' }}>
          {formatPrice(oldPrice!)}
        </Text>
      )}
    </View>
  );
}
