import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, repos } from '@/api';
import { Button, EmptyState, Header, Screen } from '@/components';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function NoCoverage() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const noStore = reason === 'no-store';
  const lastAttempt = useTenantStore((s) => s.lastAttempt);
  const email = useAuthStore((s) => s.user?.email);
  const [busy, setBusy] = useState(false);

  async function notify() {
    const loc = lastAttempt ?? env.demoLocation;
    setBusy(true);
    try {
      await repos.tenant.notifyCoverage(loc, email || undefined);
      toast(tr('coverage.notified'), 'success');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : tr('errors.generic'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Header />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          emoji={noStore ? '🛵' : '🗺️'}
          title={noStore ? tr('coverage.noStoreTitle') : tr('coverage.noCityTitle')}
          message={noStore ? tr('coverage.noStoreBody') : tr('coverage.noCityBody')}
        />
      </View>
      <View style={{ paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.lg, gap: t.spacing.md }}>
        <Button title={tr('coverage.notify')} icon="notifications-outline" variant="dark" size="lg" loading={busy} onPress={notify} />
        <Button title={tr('coverage.seeCities')} variant="secondary" size="lg" onPress={() => router.replace('/city-select')} />
      </View>
    </Screen>
  );
}
