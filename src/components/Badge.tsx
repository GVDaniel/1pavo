import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type BadgeTone = 'accent' | 'dark' | 'sun' | 'success' | 'muted' | 'warning';

export function Badge({ label, tone = 'muted' }: { label: string; tone?: BadgeTone }) {
  const t = useTheme();
  const map = {
    accent: [t.colors.accent, t.colors.accentText],
    dark: [t.isDark ? t.colors.surfaceAlt : '#141726', '#FFFFFF'],
    sun: [t.colors.cta, t.colors.ctaText],
    success: [`${t.colors.success}22`, t.colors.success],
    warning: [`${t.colors.warning}22`, t.colors.warning],
    muted: [t.colors.surfaceAlt, t.colors.textSecondary],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: t.radius.pill, alignSelf: 'flex-start' }}>
      <Text variant="caption" color={fg} style={{ fontFamily: t.fonts.bodyBold }}>
        {label}
      </Text>
    </View>
  );
}
