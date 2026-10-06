import React from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Header, RadioRow, Screen, Text } from '@/components';
import { Language, ThemeMode, usePrefsStore } from '@/store/prefsStore';
import { nightMode } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

const MODES: ThemeMode[] = ['auto-night', 'light', 'dark', 'system'];
const LANGS: { key: Language; label: string; ready: boolean }[] = [
  { key: 'es', label: 'Español', ready: true },
  { key: 'ca', label: 'Català', ready: false },
  { key: 'gl', label: 'Galego', ready: false },
  { key: 'eu', label: 'Euskara', ready: false },
  { key: 'en', label: 'English', ready: false },
];

export default function Settings() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { themeMode, setThemeMode, language, setLanguage, notifications, setNotification } = usePrefsStore();

  return (
    <Screen>
      <Header title={tr('settings.title')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: 48, gap: t.spacing.xxl }}>
        <View style={{ gap: t.spacing.sm }}>
          <Text variant="h3">{tr('settings.appearance')}</Text>
          {MODES.map((m) => (
            <RadioRow
              key={m}
              icon={m === 'auto-night' ? 'moon-outline' : m === 'light' ? 'sunny-outline' : m === 'dark' ? 'moon' : 'phone-portrait-outline'}
              title={tr(`settings.mode.${m}`)}
              subtitle={m === 'auto-night' ? tr('settings.autoNightSub', { from: nightMode.startHour, to: nightMode.endHour }) : undefined}
              selected={themeMode === m}
              onPress={() => setThemeMode(m)}
            />
          ))}
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <Text variant="h3">{tr('settings.language')}</Text>
          {LANGS.map((l) => (
            <RadioRow key={l.key} title={l.label} subtitle={l.ready ? undefined : tr('settings.soon')} selected={language === l.key} disabled={!l.ready} onPress={() => setLanguage(l.key)} />
          ))}
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <Text variant="h3">{tr('settings.notifications')}</Text>
          <Card style={{ gap: t.spacing.lg }}>
            {(['orders', 'promos', 'news'] as const).map((k) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{tr(`settings.notif.${k}`)}</Text>
                  <Text variant="caption" tone="textSecondary">
                    {tr(`settings.notif.${k}Sub`)}
                  </Text>
                </View>
                <Switch
                  value={notifications[k]}
                  onValueChange={(v) => setNotification(k, v)}
                  trackColor={{ true: t.colors.ctaStrong, false: t.colors.borderStrong }}
                  thumbColor="#fff"
                  accessibilityLabel={tr(`settings.notif.${k}`)}
                />
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
