import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Screen, Text } from '@/components';
import { useOrder } from '@/hooks/queries';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTime } from '@/utils/format';

export default function OrderSuccess() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order } = useOrder(id);
  const ring = useSharedValue(0);
  const check = useSharedValue(0);
  const text = useSharedValue(0);

  useEffect(() => {
    ring.value = withSpring(1, { damping: 10, stiffness: 110 });
    check.value = withDelay(220, withSpring(1, { damping: 7 }));
    text.value = withDelay(420, withTiming(1, { duration: 380 }));
  }, [ring, check, text]);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ring.value }] }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: check.value }, { rotate: `${(1 - check.value) * -40}deg` }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: text.value, transform: [{ translateY: (1 - text.value) * 12 }] }));

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: t.spacing.xl, gap: t.spacing.xxl }}>
        <Animated.View style={[{ width: 160, height: 160, borderRadius: 80, backgroundColor: t.colors.cta, alignItems: 'center', justifyContent: 'center' }, ringStyle]}>
          <Animated.View style={checkStyle}>
            <Icon name="checkmark" size={88} color={t.colors.ctaText} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[{ alignItems: 'center', gap: t.spacing.sm }, textStyle]}>
          <Text variant="display" align="center">
            {tr('success.title')}
          </Text>
          <Text tone="textSecondary" align="center">
            {order ? tr('success.body', { store: order.storeName, time: formatTime(order.etaAt) }) : ' '}
          </Text>
          {order && (
            <Text variant="smallStrong" tone="textMuted">
              {order.code}
            </Text>
          )}
          {order?.deliveryCode ? (
            <View style={{ marginTop: t.spacing.md, alignItems: 'center', gap: 4 }}>
              <Text variant="small" tone="textMuted">
                {tr('success.deliveryCode')}
              </Text>
              <Text variant="display" align="center">
                {order.deliveryCode}
              </Text>
              <Text variant="small" tone="textSecondary" align="center">
                {tr('success.deliveryCodeHint')}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </View>
      <View style={{ paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.lg, gap: t.spacing.md }}>
        <Button title={tr('success.track')} variant="dark" size="lg" icon="navigate" onPress={() => router.replace(`/tracking/${id}`)} />
        <Button title={tr('success.home')} variant="secondary" size="lg" onPress={() => router.replace('/(tabs)')} />
      </View>
    </Screen>
  );
}
