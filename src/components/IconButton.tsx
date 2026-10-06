import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { hapticSelect } from '@/utils/haptics';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  dot?: boolean;
  variant?: 'surface' | 'glass' | 'plain';
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, onPress, accessibilityLabel, dot, variant = 'surface', size = 44, style }: Props) {
  const t = useTheme();
  const bg =
    variant === 'surface' ? t.colors.surface : variant === 'glass' ? t.colors.tabBar : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      onPress={() => {
        hapticSelect();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
          borderWidth: variant === 'surface' && t.isDark ? 1 : 0,
          borderColor: t.colors.border,
        },
        variant === 'glass' && t.shadow.sm,
        style,
      ]}
    >
      <Icon name={icon} size={size * 0.48} color={t.colors.textPrimary} />
      {dot && (
        <View
          style={{
            position: 'absolute',
            top: size * 0.22,
            right: size * 0.24,
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: t.colors.accent,
            borderWidth: 2,
            borderColor: bg === 'transparent' ? t.colors.background : bg,
          }}
        />
      )}
    </Pressable>
  );
}
