import { router } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ErrorState, Header, Screen, Skeleton, Text } from '@/components';
import { usePromos } from '@/hooks/queries';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDate, formatPrice } from '@/utils/format';

export default function Coupons() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { data, isLoading, isError, refetch } = usePromos();
  const applied = useCartStore((s) => s.promo);
  const apply = useCartStore((s) => s.applyPromo);
  const cartCount = useCartStore((s) => s.items.length);

  return (
    <Screen>
      <Header title={tr('coupons.title')} subtitle={tr('coupons.subtitle')} />
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md, paddingBottom: 48 }}
          ListEmptyComponent={isLoading ? <Skeleton height={150} /> : <EmptyState emoji="🎟️" title={tr('coupons.emptyTitle')} />}
          renderItem={({ item }) => {
            const isApplied = applied?.code === item.code;
            return (
              <View style={{ borderRadius: t.radius.lg, backgroundColor: t.colors.surface, overflow: 'hidden', flexDirection: 'row', borderWidth: t.isDark ? 1 : 0, borderColor: t.colors.border }}>
                <View style={{ width: 14, backgroundColor: item.type === 'free_delivery' ? t.colors.ctaStrong : item.type === 'percent' ? t.colors.accent : t.colors.cta }} />
                <View style={{ flex: 1, padding: t.spacing.lg, gap: t.spacing.sm }}>
                  <Text variant="h3">{item.title}</Text>
                  <Text variant="small" tone="textSecondary">
                    {item.description}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: t.spacing.sm, gap: t.spacing.md }}>
                    <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.colors.borderStrong, borderRadius: t.radius.sm, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text variant="bodyStrong" style={{ letterSpacing: 1 }}>
                        {item.code}
                      </Text>
                    </View>
                    <Button
                      size="sm"
                      full={false}
                      variant={isApplied ? 'secondary' : 'dark'}
                      icon={isApplied ? 'checkmark' : undefined}
                      title={isApplied ? tr('coupons.applied') : tr('coupons.apply')}
                      disabled={isApplied}
                      onPress={() => {
                        apply(item);
                        toast(tr('cart.promoApplied', { code: item.code }), 'success');
                        if (cartCount) router.push('/cart');
                      }}
                    />
                  </View>
                  <Text variant="caption" tone="textMuted">
                    {tr('coupons.conditions', { min: formatPrice(item.minOrder), date: formatDate(item.expiresAt) })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}
