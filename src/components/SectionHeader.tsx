import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
  right,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  right?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: t.spacing.lg,
        marginBottom: t.spacing.md,
        gap: t.spacing.md,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="h2">{title}</Text>
        {!!subtitle && (
          <Text variant="small" tone="textSecondary" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
      {!!action && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text variant="smallStrong" tone="textSecondary" style={{ textDecorationLine: 'underline' }}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
