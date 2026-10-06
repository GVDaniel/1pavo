import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { IconButton } from './IconButton';
import { Text } from './Text';

type Props = {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  close?: boolean;
  large?: boolean;
};

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function Header({ title, subtitle, right, onBack, close, large }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.sm, paddingBottom: t.spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <IconButton
          icon={close ? 'close' : 'chevron-back'}
          accessibilityLabel={close ? tr('common.close') : tr('common.back')}
          onPress={onBack ?? goBack}
        />
        {!large && (
          <View style={{ flex: 1 }}>
            {!!title && (
              <Text variant="h3" numberOfLines={1}>
                {title}
              </Text>
            )}
            {!!subtitle && (
              <Text variant="caption" tone="textSecondary" numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
        {large && <View style={{ flex: 1 }} />}
        {right}
      </View>
      {large && !!title && (
        <View style={{ marginTop: t.spacing.lg }}>
          <Text variant="h1">{title}</Text>
          {!!subtitle && (
            <Text tone="textSecondary" style={{ marginTop: t.spacing.xs }}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
