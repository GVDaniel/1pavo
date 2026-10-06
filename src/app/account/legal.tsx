import React from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header, Screen, Text } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';

/** Placeholder: sustituir por los textos legales reales (o un WebView a la web). */
export default function Legal() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const sections = ['terms', 'privacy', 'alcohol', 'cookies'] as const;
  return (
    <Screen>
      <Header title={tr('legal.title')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: 48, gap: t.spacing.lg }}>
        {sections.map((s) => (
          <React.Fragment key={s}>
            <Text variant="h3">{tr(`legal.${s}Title`)}</Text>
            <Text tone="textSecondary">{tr(`legal.${s}Body`)}</Text>
          </React.Fragment>
        ))}
      </ScrollView>
    </Screen>
  );
}
