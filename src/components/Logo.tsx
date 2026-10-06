import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

/** Logo placeholder: la moneda de "1" + "pavo". Sustituir por el SVG definitivo. */
export function Logo({ size = 32, color }: { size?: number; color?: string }) {
  const t = useTheme();
  const coin = size * 1.15;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.12 }} accessible accessibilityLabel="1pavo">
      <View
        style={{
          width: coin,
          height: coin,
          borderRadius: coin / 2,
          backgroundColor: t.colors.cta,
          borderWidth: size * 0.08,
          borderColor: t.colors.ctaText,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '-8deg' }],
        }}
      >
        <Text style={{ fontFamily: t.fonts.display, fontSize: size * 0.8, lineHeight: size * 0.95, color: t.colors.ctaText }}>1</Text>
      </View>
      <Text style={{ fontFamily: t.fonts.display, fontSize: size, lineHeight: size * 1.1, letterSpacing: -size * 0.04, color: color ?? t.colors.textPrimary }}>
        pavo
      </Text>
    </View>
  );
}
