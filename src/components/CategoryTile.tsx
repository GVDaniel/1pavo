import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { tint, useTheme } from '@/theme/ThemeProvider';
import { Category } from '@/types';
import { Text } from './Text';

export function CategoryTile({
  category,
  variant = 'small',
  width,
}: {
  category: Category;
  variant?: 'small' | 'large';
  width: number;
}) {
  const t = useTheme();
  const go = () => router.push(`/category/${category.id}`);

  if (variant === 'large') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={category.name}
        onPress={go}
        style={({ pressed }) => ({
          width,
          height: 132,
          borderRadius: t.radius.xl,
          backgroundColor: tint(category.hue, t.isDark),
          padding: t.spacing.lg,
          overflow: 'hidden',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text variant="h3" style={{ maxWidth: width * 0.62 }}>
          {category.name}
        </Text>
        <Text
          style={{ position: 'absolute', right: -6, bottom: -14, fontSize: 78, lineHeight: 96, transform: [{ rotate: '-12deg' }] }}
          accessible={false}
        >
          {category.emoji}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={go}
      style={({ pressed }) => ({ width, alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          width,
          height: width,
          borderRadius: t.radius.lg,
          backgroundColor: tint(category.hue, t.isDark),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: width * 0.44, lineHeight: width * 0.58 }} accessible={false}>
          {category.emoji}
        </Text>
      </View>
      <Text variant="caption" tone="textSecondary" numberOfLines={2} align="center">
        {category.name}
      </Text>
    </Pressable>
  );
}
