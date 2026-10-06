import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

export function EmptyState({
  emoji,
  title,
  message,
  action,
  onAction,
}: {
  emoji: string;
  title: string;
  message?: string;
  action?: string;
  onAction?: () => void;
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: t.spacing.xxxl, paddingVertical: t.spacing.huge, gap: t.spacing.md }}>
      <View
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          backgroundColor: t.colors.highlight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: t.spacing.sm,
        }}
      >
        <Text style={{ fontSize: 50, lineHeight: 62 }}>{emoji}</Text>
      </View>
      <Text variant="h2" align="center">
        {title}
      </Text>
      {!!message && (
        <Text tone="textSecondary" align="center">
          {message}
        </Text>
      )}
      {!!action && <Button title={action} onPress={onAction} full={false} style={{ marginTop: t.spacing.sm }} />}
    </View>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      emoji="📡"
      title={t('errors.title')}
      message={message ?? t('errors.generic')}
      action={onRetry ? t('common.retry') : undefined}
      onAction={onRetry}
    />
  );
}
