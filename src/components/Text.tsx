import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { ColorKey, Theme, useTheme } from '@/theme/ThemeProvider';

export type TextVariant = keyof Theme['type'];

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: ColorKey;
  /** Color literal (sobrescribe `tone`); úsalo solo para colores de contenido como banners */
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', tone = 'textPrimary', color, align, style, ...rest }: TextProps) {
  const t = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[t.type[variant], { color: color ?? t.colors[tone], textAlign: align }, style]}
    />
  );
}
