import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

export function Skeleton({
  width = '100%',
  height = 16,
  radius,
  style,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.45, { duration: 750 }), -1, true);
  }, [o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      accessibilityElementsHidden
      style={[{ width, height, borderRadius: radius ?? t.radius.md, backgroundColor: t.colors.skeleton }, anim, style]}
    />
  );
}

export function ProductCardSkeleton({ width }: { width: number }) {
  const t = useTheme();
  return (
    <Animated.View style={{ width, gap: t.spacing.sm }}>
      <Skeleton height={width * 0.92} radius={t.radius.lg} />
      <Skeleton width={56} height={22} />
      <Skeleton width="85%" height={14} />
      <Skeleton width="50%" height={12} />
    </Animated.View>
  );
}
