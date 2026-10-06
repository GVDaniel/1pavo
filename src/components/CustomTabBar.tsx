import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { hapticSelect } from '@/utils/haptics';
import { FloatingCartBar } from './FloatingCartBar';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

const ICONS: Record<string, [IconName, IconName]> = {
  index: ['home', 'home-outline'],
  search: ['search', 'search-outline'],
  orders: ['receipt', 'receipt-outline'],
  profile: ['person', 'person-outline'],
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
      <FloatingCartBar />
      <View style={{ borderTopWidth: 1, borderTopColor: t.colors.border, overflow: 'hidden' }}>
        <BlurView
          intensity={50}
          tint={t.isDark ? 'dark' : 'light'}
          style={{
            flexDirection: 'row',
            backgroundColor: t.colors.tabBar,
            paddingTop: t.spacing.sm,
            paddingBottom: Math.max(insets.bottom, t.spacing.md),
          }}
        >
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const icons = ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
            const onPress = () => {
              hapticSelect();
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.title}
                onPress={onPress}
                style={{ flex: 1, alignItems: 'center', gap: 3 }}
              >
                <View
                  style={{
                    width: 54,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: focused ? t.colors.cta : 'transparent',
                  }}
                >
                  <Icon name={focused ? icons[0] : icons[1]} size={21} color={focused ? t.colors.ctaText : t.colors.textSecondary} />
                </View>
                <Text variant="caption" tone={focused ? 'textPrimary' : 'textMuted'} style={focused ? { fontFamily: t.fonts.bodyBold } : undefined}>
                  {options.title}
                </Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
