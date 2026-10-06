import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Card, Header, Icon, Screen, Text } from '@/components';
import { useCurrentTenant } from '@/hooks/queries';
import { useTheme } from '@/theme/ThemeProvider';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export default function Help() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const tenant = useCurrentTenant();
  const [open, setOpen] = useState<string | null>(FAQ_KEYS[0]);

  return (
    <Screen>
      <Header title={tr('help.title')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: 48, gap: t.spacing.md }}>
        {tenant.data?.config.features.supportChat && (
          <Card tone="highlight" style={{ gap: t.spacing.md }}>
            <Text variant="h3">{tr('help.chatTitle')}</Text>
            <Text tone="textSecondary">{tr('help.chatBody')}</Text>
            <Button title={tr('help.chatCta')} icon="chatbubble-ellipses" variant="dark" onPress={() => router.push('/account/chat')} />
          </Card>
        )}
        <Text variant="h3" style={{ marginTop: t.spacing.md }}>
          {tr('help.faq')}
        </Text>
        {FAQ_KEYS.map((k) => {
          const expanded = open === k;
          return (
            <Card key={k} style={{ paddingVertical: t.spacing.md }}>
              <Pressable onPress={() => setOpen(expanded ? null : k)} accessibilityRole="button" accessibilityState={{ expanded }} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  {tr(`help.${k}`)}
                </Text>
                <Icon name={expanded ? 'remove' : 'add'} size={20} color={t.colors.textSecondary} />
              </Pressable>
              {expanded && (
                <View style={{ marginTop: t.spacing.sm }}>
                  <Text tone="textSecondary">{tr(`help.a${k.slice(1)}`)}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
