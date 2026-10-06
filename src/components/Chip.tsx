import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { hapticSelect } from '@/utils/haptics';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

export function Chip({
  label,
  selected,
  onPress,
  icon,
  size = 'md',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  size?: 'sm' | 'md';
}) {
  const t = useTheme();
  const fg = selected ? t.colors.ctaStrongText : t.colors.textPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        hapticSelect();
        onPress?.();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: size === 'sm' ? 32 : 38,
        paddingHorizontal: size === 'sm' ? 12 : 16,
        borderRadius: t.radius.pill,
        backgroundColor: selected ? t.colors.ctaStrong : t.colors.surface,
        borderWidth: 1,
        borderColor: selected ? t.colors.ctaStrong : t.colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {icon && <Icon name={icon} size={15} color={fg} />}
      <Text variant="smallStrong" color={fg}>
        {label}
      </Text>
    </Pressable>
  );
}
