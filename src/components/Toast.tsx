import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export function ToastHost() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { message, kind, key, hide } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(hide, 2800);
    return () => clearTimeout(id);
  }, [key, message, hide]);

  if (!message) return null;
  const icon = kind === 'success' ? 'checkmark-circle' : kind === 'error' ? 'alert-circle' : 'information-circle';
  const iconColor = kind === 'success' ? t.colors.success : kind === 'error' ? t.colors.error : t.colors.cta;

  return (
    <Animated.View
      key={key}
      entering={FadeInUp.springify().damping(16)}
      exiting={FadeOutUp}
      style={{ position: 'absolute', top: insets.top + 8, left: t.spacing.lg, right: t.spacing.lg, zIndex: 999 }}
      accessibilityLiveRegion="polite"
    >
      <Pressable
        onPress={hide}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.spacing.md,
            backgroundColor: t.isDark ? t.colors.surfaceElevated : '#141726',
            borderRadius: t.radius.lg,
            paddingVertical: t.spacing.md,
            paddingHorizontal: t.spacing.lg,
          },
          t.shadow.lg,
        ]}
      >
        <Icon name={icon} size={22} color={iconColor} />
        <Text variant="smallStrong" color="#FFFFFF" style={{ flex: 1 }}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
