import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  BannerCarousel,
  BottomSheet,
  Button,
  CategoryTile,
  Countdown,
  ErrorState,
  Icon,
  IconButton,
  ProductRail,
  RadioRow,
  SectionHeader,
  Skeleton,
  StoreStatusBadge,
  TAB_BAR_SPACE,
  Text,
} from '@/components';
import { useSwitchLocation } from '@/features/tenant/useSwitchLocation';
import {
  useAddresses,
  useCategories,
  useCurrentStore,
  useCurrentTenant,
  useHomeFeed,
  useNotifications,
  useOrders,
  useProducts,
} from '@/hooks/queries';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useTheme } from '@/theme/ThemeProvider';
import { Daypart } from '@/types';
import { getDaypart } from '@/utils/time';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURED: Record<Daypart, [string, string]> = {
  morning: ['panaderia', 'desayuno'],
  afternoon: ['bebidas', 'helados'],
  night: ['snacks', 'listo'],
  late: ['chuches', 'emergencias'],
};

export default function Home() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { width } = useWindowDimensions();
  const daypart = getDaypart();

  const feed = useHomeFeed();
  const cats = useCategories();
  const store = useCurrentStore();
  const tenant = useCurrentTenant();
  const orders = useOrders();
  const notifications = useNotifications();
  const address = useTenantStore((s) => s.deliveryAddress);
  const storeName = useTenantStore((s) => s.storeName);
  const tenantName = useTenantStore((s) => s.tenantName);
  const user = useAuthStore((s) => s.user);

  const [sheet, setSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const lastDelivered = orders.data?.find((o) => o.status === 'delivered');
  const again = useProducts({ ids: lastDelivered?.items.map((i) => i.productId) }, !!lastDelivered);
  const active = orders.data?.find((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const unread = notifications.data?.some((n) => !n.read);

  const featured = FEATURED[daypart];
  const big = cats.data?.filter((c) => featured.includes(c.id)) ?? [];
  const small = cats.data?.filter((c) => !featured.includes(c.id)) ?? [];
  const bigW = (width - t.spacing.lg * 2 - t.spacing.md) / 2;
  const smallW = (width - t.spacing.lg * 2 - t.spacing.md * 3) / 4;

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([feed.refetch(), orders.refetch(), notifications.refetch()]);
    setRefreshing(false);
  };

  const eta = tenant.data ? `${tenant.data.config.etaMin}–${tenant.data.config.etaMax} min` : '';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* Barra superior */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm, gap: t.spacing.md }}>
        <Pressable
          onPress={() => setSheet(true)}
          accessibilityRole="button"
          accessibilityLabel={tr('home.changeAddressA11y', { address: address?.street ?? '' })}
          style={{ flex: 1 }}
        >
          <Text variant="caption" tone="textSecondary">
            {tr('home.deliverTo')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {address?.street ?? tr('home.chooseAddress')}
            </Text>
            <Icon name="chevron-down" size={16} color={t.colors.textPrimary} />
          </View>
        </Pressable>
        <IconButton icon="notifications-outline" accessibilityLabel={tr('home.notifications')} dot={unread} onPress={() => router.push('/account/notifications')} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.colors.textMuted} />}
      >
        {/* Hero tipográfico según la franja horaria */}
        <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md, paddingBottom: t.spacing.xl }}>
          {!!user && (
            <Text variant="bodyMedium" tone="textSecondary" style={{ marginBottom: 2 }}>
              {tr('home.hello', { name: user.firstName })}
            </Text>
          )}
          <Text variant="display" style={{ fontSize: 36, lineHeight: 38 }}>
            {tr(`home.greeting.${daypart}`)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginTop: t.spacing.md, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="storefront-outline" size={15} color={t.colors.textSecondary} />
              <Text variant="small" tone="textSecondary">
                {storeName}
              </Text>
            </View>
            {store.data && <StoreStatusBadge status={store.data.status} />}
            {!!eta && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="time-outline" size={15} color={t.colors.textSecondary} />
                <Text variant="small" tone="textSecondary">
                  {eta}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Buscador (acceso rápido) */}
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          style={{
            marginHorizontal: t.spacing.lg,
            height: 52,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.surface,
            borderWidth: 1,
            borderColor: t.colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: t.spacing.lg,
            gap: t.spacing.sm,
            marginBottom: t.spacing.xl,
          }}
        >
          <Icon name="search" size={19} color={t.colors.textMuted} />
          <Text tone="textMuted">{tr('home.searchPlaceholder')}</Text>
        </Pressable>

        {/* Pedido en curso */}
        {active && (
          <Pressable
            onPress={() => router.push(`/tracking/${active.id}`)}
            style={{ marginHorizontal: t.spacing.lg, marginBottom: t.spacing.xl, borderRadius: t.radius.lg, backgroundColor: t.colors.ctaStrong, padding: t.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}
          >
            <Text style={{ fontSize: 30, lineHeight: 38 }}>🛵</Text>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" color={t.colors.ctaStrongText}>
                {tr(`orderStatus.${active.status}`)}
              </Text>
              <Text variant="caption" color={t.colors.ctaStrongText} style={{ opacity: 0.7 }}>
                {tr('home.activeOrder', { code: active.code })}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={t.colors.ctaStrongText} />
          </Pressable>
        )}

        {feed.isError ? (
          <ErrorState onRetry={feed.refetch} />
        ) : (
          <>
            {feed.data ? <BannerCarousel banners={feed.data.banners} /> : <Skeleton height={176} radius={t.radius.xl} style={{ marginHorizontal: t.spacing.lg, width: 'auto' }} />}

            {/* Categorías en bento */}
            <View style={{ marginTop: t.spacing.xxxl }}>
              <SectionHeader title={tr('home.categories')} />
              <View style={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md }}>
                <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
                  {cats.data
                    ? big.map((c) => <CategoryTile key={c.id} category={c} variant="large" width={bigW} />)
                    : [0, 1].map((i) => <Skeleton key={i} width={bigW} height={132} radius={t.radius.xl} />)}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: t.spacing.md, rowGap: t.spacing.lg }}>
                  {small.map((c) => (
                    <CategoryTile key={c.id} category={c} width={smallW} />
                  ))}
                </View>
              </View>
            </View>

            {/* Ofertas relámpago */}
            {(feed.isLoading || !!feed.data?.flashDeals.length) && (
              <View style={{ marginTop: t.spacing.xxxl }}>
                <SectionHeader
                  title={tr('home.flash')}
                  subtitle={tr('home.flashSub')}
                  right={feed.data ? <Countdown to={feed.data.flashEndsAt} /> : undefined}
                />
                <ProductRail data={feed.data?.flashDeals} loading={feed.isLoading} />
              </View>
            )}

            {/* Para ahora (según franja) */}
            <View style={{ marginTop: t.spacing.xxxl }}>
              <SectionHeader title={tr(`home.forNow.${daypart}`)} />
              <ProductRail data={feed.data?.forNow} loading={feed.isLoading} />
            </View>

            {/* Vuelve a pedir */}
            {lastDelivered && !!again.data?.length && (
              <View style={{ marginTop: t.spacing.xxxl }}>
                <SectionHeader title={tr('home.again')} action={tr('home.seeOrders')} onAction={() => router.push('/orders')} />
                <ProductRail data={again.data} />
              </View>
            )}

            {/* Lo más pedido */}
            <View style={{ marginTop: t.spacing.xxxl }}>
              <SectionHeader title={tr('home.popular', { city: tenantName ?? '' })} />
              <ProductRail data={feed.data?.popular} loading={feed.isLoading} />
            </View>
          </>
        )}
      </ScrollView>

      <AddressSheet visible={sheet} onClose={() => setSheet(false)} />
    </SafeAreaView>
  );
}

function AddressSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const isGuest = useAuthStore((s) => !s.token);
  const addresses = useAddresses();
  const current = useTenantStore((s) => s.deliveryAddress);
  const { switchTo } = useSwitchLocation();

  const go = (path: '/location' | '/city-select' | '/account/addresses' | '/auth/login') => {
    onClose();
    router.push(path);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={tr('home.deliverTo')}>
      <View style={{ gap: t.spacing.sm, paddingBottom: t.spacing.lg }}>
        {isGuest ? (
          <Text tone="textSecondary" style={{ marginBottom: t.spacing.sm }}>
            {tr('home.guestAddresses')}
          </Text>
        ) : (
          addresses.data?.map((a) => (
            <RadioRow
              key={a.id}
              icon={a.label === 'Casa' ? 'home-outline' : a.label === 'Trabajo' ? 'briefcase-outline' : 'location-outline'}
              title={a.label}
              subtitle={a.street}
              selected={current?.addressId === a.id}
              onPress={async () => {
                onClose();
                const r = await switchTo({ label: a.label, street: a.street, location: a.location, addressId: a.id });
                if (r !== 'ok') router.push({ pathname: '/no-coverage', params: { reason: r } });
              }}
            />
          ))
        )}
        <View style={{ gap: t.spacing.sm, marginTop: t.spacing.md }}>
          <Button title={tr('home.useCurrentLocation')} icon="navigate-outline" variant="secondary" onPress={() => go('/location')} />
          {isGuest ? (
            <Button title={tr('home.loginForAddresses')} variant="dark" onPress={() => go('/auth/login')} />
          ) : (
            <Button title={tr('home.manageAddresses')} icon="add" variant="secondary" onPress={() => go('/account/addresses')} />
          )}
          <Button title={tr('home.changeCity')} icon="map-outline" variant="ghost" onPress={() => go('/city-select')} />
        </View>
      </View>
    </BottomSheet>
  );
}
