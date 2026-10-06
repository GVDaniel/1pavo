import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Logo, Text } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useHydrated } from '@/store/useHydrated';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

/** Splash animado + enrutado inicial según estado */
export default function Splash() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const hydrated = useHydrated();
  const scale = useSharedValue(0.6);
  const rotate = useSharedValue(-30);
  const tagline = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 9, stiffness: 120 });
    rotate.value = withSequence(withSpring(6, { damping: 6 }), withSpring(0));
    tagline.value = withDelay(350, withTiming(1, { duration: 400 }));
  }, [scale, rotate, tagline]);

  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      const { hasOnboarded } = useAuthStore.getState();
      const { storeId } = useTenantStore.getState();
      if (!hasOnboarded) router.replace('/onboarding');
      else if (!storeId) router.replace('/location');
      else router.replace('/(tabs)');
    }, 1300);
    return () => clearTimeout(id);
  }, [hydrated]);

  const logo = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }] }));
  const tag = useAnimatedStyle(() => ({ opacity: tagline.value, transform: [{ translateY: (1 - tagline.value) * 8 }] }));

  return (
    <View style={{ flex: 1, backgroundColor: '#0D1024', alignItems: 'center', justifyContent: 'center', gap: t.spacing.lg }}>
      <Animated.View style={logo}>
        <Logo size={52} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={tag}>
        <Text variant="bodyMedium" color="#A9AFC8">
          {tr('splash.tagline')}
        </Text>
      </Animated.View>
    </View>
  );
}
