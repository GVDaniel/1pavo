import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

/**
 * Bottom sheet ligero (Modal + Reanimated), sin dependencias nativas extra.
 * Si prefieres @gorhom/bottom-sheet, basta con reimplementar este componente.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  scroll = true,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const p = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      p.value = withTiming(1, { duration: 280 });
    } else {
      p.value = withTiming(0, { duration: 200 }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [visible, p]);

  const backdrop = useAnimatedStyle(() => ({ opacity: p.value }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - p.value) * 600 }] }));

  const Body = scroll ? ScrollView : View;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.overlay }, backdrop]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Cerrar" />
        </Animated.View>
        <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
          <Animated.View
            style={[
              {
                backgroundColor: t.colors.surface,
                borderTopLeftRadius: t.radius.xl,
                borderTopRightRadius: t.radius.xl,
                maxHeight: '88%',
                paddingBottom: Math.max(insets.bottom, t.spacing.lg),
              },
              sheet,
            ]}
          >
            <View style={{ alignItems: 'center', paddingTop: t.spacing.sm }}>
              <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: t.colors.borderStrong }} />
            </View>
            {!!title && (
              <Text variant="h2" style={{ paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.lg }}>
                {title}
              </Text>
            )}
            <Body
              {...(scroll ? { keyboardShouldPersistTaps: 'handled' as const } : {})}
              style={{ paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.lg }}
            >
              {children}
            </Body>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
