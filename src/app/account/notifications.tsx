import React, { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { repos } from '@/api';
import { EmptyState, Header, Icon, IconName, Screen, Skeleton, Text } from '@/components';
import { useNotifications } from '@/hooks/queries';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDate, formatTime } from '@/utils/format';

const ICON: Record<string, IconName> = { order: 'receipt-outline', promo: 'pricetag-outline', info: 'information-circle-outline' };

export default function Notifications() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { data, isLoading } = useNotifications();
  const qc = useQueryClient();

  useEffect(() => {
    return () => {
      if (!useAuthStore.getState().token) return;
      repos.notifications.markAllRead().then(() => qc.invalidateQueries({ queryKey: ['notifications'] }));
    };
  }, [qc]);

  return (
    <Screen>
      <Header title={tr('notifications.title')} />
      <FlatList
        data={data ?? []}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.sm, paddingBottom: 48 }}
        ListEmptyComponent={isLoading ? <Skeleton height={80} /> : <EmptyState emoji="🔔" title={tr('notifications.emptyTitle')} message={tr('notifications.emptyBody')} />}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', gap: t.spacing.md, padding: t.spacing.lg, borderRadius: t.radius.lg, backgroundColor: item.read ? t.colors.surface : t.colors.highlight }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={ICON[item.kind]} size={19} color={t.colors.textPrimary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong">{item.title}</Text>
              <Text variant="small" tone="textSecondary">
                {item.body}
              </Text>
              <Text variant="caption" tone="textMuted" style={{ marginTop: 4 }}>
                {`${formatDate(item.createdAt)}, ${formatTime(item.createdAt)}`}
              </Text>
            </View>
            {!item.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.accent, marginTop: 6 }} />}
          </View>
        )}
      />
    </Screen>
  );
}
