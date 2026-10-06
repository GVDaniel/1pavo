import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { hapticSelect } from '@/utils/haptics';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  full = true,
  style,
  accessibilityLabel,
}: Props) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const colors = {
    primary: { bg: t.colors.cta, fg: t.colors.ctaText, border: 'transparent' },
    dark: { bg: t.colors.ctaStrong, fg: t.colors.ctaStrongText, border: 'transparent' },
    secondary: { bg: t.colors.surfaceAlt, fg: t.colors.textPrimary, border: 'transparent' },
    ghost: { bg: 'transparent', fg: t.colors.textPrimary, border: t.colors.border },
    danger: { bg: t.colors.accentSoft, fg: t.colors.error, border: 'transparent' },
  }[variant];
  const height = { sm: 40, md: 52, lg: 58 }[size];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPressIn={() => (scale.value = withSpring(0.97, { damping: 18 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 18 }))}
      onPress={() => {
        hapticSelect();
        onPress?.();
      }}
      style={[
        {
          height,
          borderRadius: t.radius.pill,
          backgroundColor: colors.bg,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.spacing.sm,
          paddingHorizontal: size === 'sm' ? t.spacing.lg : t.spacing.xxl,
          opacity: disabled ? 0.45 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
        anim,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'sm' ? 16 : 19} color={colors.fg} />}
          <Text variant={size === 'sm' ? 'smallStrong' : 'button'} color={colors.fg} numberOfLines={1}>
            {title}
          </Text>
          {iconRight && <Icon name={iconRight} size={18} color={colors.fg} />}
        </>
      )}
    </AnimatedPressable>
  );
}
