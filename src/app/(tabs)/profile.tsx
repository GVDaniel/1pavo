import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { repos } from '@/api';
import { Avatar, Button, Card, Divider, ListRow, Logo, TAB_BAR_SPACE, Text } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import Constants from 'expo-constants';

export default function Profile() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const city = useTenantStore((s) => s.tenantName);
  const store = useTenantStore((s) => s.storeName);

  const confirmDelete = () =>
    Alert.alert(tr('profile.deleteTitle'), tr('profile.deleteBody'), [
      { text: tr('common.cancel'), style: 'cancel' },
      {
        text: tr('profile.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          await repos.auth.deleteAccount();
          logout();
          useCartStore.getState().clear();
          toast(tr('profile.deleted'));
        },
      },
    ]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: TAB_BAR_SPACE, gap: t.spacing.xl }}>
        <Text variant="h1" style={{ marginTop: t.spacing.md }}>
          {tr('profile.title')}
        </Text>

        {user ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.lg }}>
            <Avatar first={user.firstName} last={user.lastName} />
            <View style={{ flex: 1 }}>
              <Text variant="h3">{`${user.firstName} ${user.lastName}`}</Text>
              <Text variant="small" tone="textSecondary">
                {user.email}
              </Text>
              <Text variant="small" tone="textSecondary">
                {user.phone}
              </Text>
            </View>
          </Card>
        ) : (
          <Card tone="highlight" style={{ gap: t.spacing.md }}>
            <Text variant="h3">{tr('profile.guestTitle')}</Text>
            <Text tone="textSecondary">{tr('profile.guestBody')}</Text>
            <Button title={tr('profile.login')} variant="dark" onPress={() => router.push('/auth/login')} />
          </Card>
        )}

        <Card style={{ paddingVertical: t.spacing.xs }}>
          <ListRow icon="location-outline" title={tr('profile.city')} subtitle={tr('profile.cityStore', { city: city ?? '', store: store ?? '' })} onPress={() => router.push('/city-select')} />
          {user && (
            <>
              <ListRow icon="home-outline" title={tr('profile.addresses')} onPress={() => router.push('/account/addresses')} />
              <ListRow icon="card-outline" title={tr('profile.payments')} onPress={() => router.push('/account/payments')} />
            </>
          )}
          <ListRow icon="pricetag-outline" title={tr('profile.coupons')} onPress={() => router.push('/account/coupons')} />
          <ListRow icon="notifications-outline" title={tr('profile.notifications')} onPress={() => router.push('/account/notifications')} />
        </Card>

        <Card style={{ paddingVertical: t.spacing.xs }}>
          <ListRow icon="settings-outline" title={tr('profile.settings')} subtitle={tr('profile.settingsSub')} onPress={() => router.push('/account/settings')} />
          <ListRow icon="help-circle-outline" title={tr('profile.help')} onPress={() => router.push('/account/help')} />
          <ListRow icon="document-text-outline" title={tr('profile.legal')} onPress={() => router.push('/account/legal')} />
          <ListRow icon="color-palette-outline" title={tr('profile.designSystem')} subtitle={tr('profile.designSystemSub')} onPress={() => router.push('/dev/design-system')} />
        </Card>

        {user && (
          <Card style={{ paddingVertical: t.spacing.xs }}>
            <ListRow icon="log-out-outline" title={tr('profile.logout')} chevron={false} onPress={() => { logout(); toast(tr('profile.loggedOut')); }} />
            <Divider spacing={0} />
            <ListRow icon="trash-outline" title={tr('profile.delete')} danger chevron={false} onPress={confirmDelete} />
          </Card>
        )}

        <View style={{ alignItems: 'center', gap: t.spacing.sm, opacity: 0.6 }}>
          <Logo size={20} />
          <Text variant="caption" tone="textMuted">
            {tr('profile.version', { version: Constants.expoConfig?.version ?? '0.1.0' })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
