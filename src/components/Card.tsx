import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function Card({
  children,
  style,
  tone = 'surface',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'highlight' | 'accent';
}) {
  const t = useTheme();
  const bg = tone === 'highlight' ? t.colors.highlight : tone === 'accent' ? t.colors.accentSoft : t.colors.surface;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: t.radius.lg,
          padding: t.spacing.lg,
          borderWidth: tone === 'surface' && t.isDark ? 1 : 0,
          borderColor: t.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
