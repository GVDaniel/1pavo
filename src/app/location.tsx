import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/components';
import { env } from '@/config/env';
import { useSwitchLocation } from '@/features/tenant/useSwitchLocation';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { LatLng } from '@/types';

export default function LocationScreen() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { switchTo } = useSwitchLocation();
  const [busy, setBusy] = useState<'gps' | 'demo' | null>(null);

  async function go(location: LatLng, street: string) {
    const r = await switchTo({ label: tr('location.current'), street, location });
    if (r === 'ok') router.replace('/(tabs)');
    else router.push({ pathname: '/no-coverage', params: { reason: r } });
  }

  async function useGps() {
    setBusy('gps');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast(tr('location.denied'));
        router.push('/city-select');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      let street = tr('location.current');
      try {
        const [geo] = await Location.reverseGeocodeAsync(coords);
        if (geo) street = [geo.street, geo.streetNumber].filter(Boolean).join(', ') || geo.city || street;
      } catch {
        /* sin geocodificación inversa: usamos texto genérico */
      }
      await go(coords, street);
    } catch {
      toast(tr('location.error'), 'error');
    } finally {
      setBusy(null);
    }
  }

  async function useDemo() {
    setBusy('demo');
    await go(env.demoLocation, 'Puerta del Sol, 1');
    setBusy(null);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flex: 1, paddingHorizontal: t.spacing.xl, justifyContent: 'center' }}>
        <View style={{ width: 132, height: 132, borderRadius: 66, backgroundColor: t.colors.cta, alignItems: 'center', justifyContent: 'center', marginBottom: t.spacing.xxxl, transform: [{ rotate: '-6deg' }] }}>
          <Text style={{ fontSize: 68, lineHeight: 84 }}>📍</Text>
        </View>
        <Text variant="display">{tr('location.title')}</Text>
        <Text tone="textSecondary" style={{ marginTop: t.spacing.md }}>
          {tr('location.body')}
        </Text>
      </View>
      <View style={{ paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.lg, gap: t.spacing.md }}>
        <Button title={tr('location.useGps')} icon="navigate" size="lg" variant="dark" onPress={useGps} loading={busy === 'gps'} />
        <Button title={tr('location.chooseCity')} variant="secondary" size="lg" onPress={() => router.push('/city-select')} />
        <Button title={tr('location.demo')} variant="ghost" size="sm" onPress={useDemo} loading={busy === 'demo'} />
      </View>
    </Screen>
  );
}
