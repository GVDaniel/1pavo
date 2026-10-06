import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ErrorState, Header, Icon, Screen, Skeleton, Text } from '@/components';
import { useSwitchLocation } from '@/features/tenant/useSwitchLocation';
import { useTenants } from '@/hooks/queries';
import { useTenantStore } from '@/store/tenantStore';
import { useTheme } from '@/theme/ThemeProvider';
import { Tenant } from '@/types';

export default function CitySelect() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { data, isLoading, isError, refetch } = useTenants();
  const { switchTo } = useSwitchLocation();
  const current = useTenantStore((s) => s.tenantId);
  const [pending, setPending] = useState<string | null>(null);

  async function pick(tenant: Tenant) {
    setPending(tenant.id);
    const r = await switchTo({ label: tenant.name, street: tr('location.cityCenter', { city: tenant.name }), location: tenant.center });
    setPending(null);
    if (r === 'ok') router.replace('/(tabs)');
    else router.push({ pathname: '/no-coverage', params: { reason: r } });
  }

  return (
    <Screen>
      <Header title={tr('cities.title')} subtitle={tr('cities.subtitle')} large />
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.sm, paddingBottom: 40 }}
          ListEmptyComponent={
            isLoading ? (
              <View style={{ gap: t.spacing.sm }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={68} radius={t.radius.lg} />
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const selected = item.id === current;
            return (
              <Pressable
                accessibilityRole="button"
                onPress={() => pick(item)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.spacing.md,
                  padding: t.spacing.lg,
                  borderRadius: t.radius.lg,
                  backgroundColor: selected ? t.colors.highlight : t.colors.surface,
                  borderWidth: 1,
                  borderColor: selected ? t.colors.cta : t.colors.border,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="h3">{item.name}</Text>
                  <Text variant="caption" tone="textSecondary">
                    {tr('cities.stores', { count: item.storeCount ?? 1 })}
                  </Text>
                </View>
                {pending === item.id ? (
                  <ActivityIndicator color={t.colors.textPrimary} />
                ) : (
                  <Icon name={selected ? 'checkmark-circle' : 'chevron-forward'} size={22} color={selected ? t.colors.textPrimary : t.colors.textMuted} />
                )}
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
