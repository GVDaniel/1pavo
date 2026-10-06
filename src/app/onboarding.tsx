import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Logo, Screen, Text } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';

const SLIDES = [
  { key: 's1', emoji: '🌙', bg: '#141726', fg: '#FFD60A' },
  { key: 's2', emoji: '🛵', bg: '#FFD60A', fg: '#141726' },
  { key: 's3', emoji: '🥐', bg: '#FF3D71', fg: '#FFFFFF' },
];

export default function Onboarding() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList>(null);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const finish = () => {
    setOnboarded();
    router.replace('/location');
  };
  const next = () => {
    if (index < SLIDES.length - 1) list.current?.scrollToIndex({ index: index + 1 });
    else finish();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: t.spacing.xl, paddingVertical: t.spacing.md }}>
        <Logo size={24} />
        <Pressable onPress={finish} hitSlop={10} accessibilityRole="button">
          <Text variant="smallStrong" tone="textSecondary">
            {tr('onboarding.skip')}
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={list}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.key}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index: i }) => (
          <View style={{ width, paddingHorizontal: t.spacing.xl, justifyContent: 'center' }}>
            <View
              style={{
                aspectRatio: 1,
                borderRadius: 40,
                backgroundColor: item.bg,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: t.spacing.xxxl,
              }}
            >
              <Text style={{ fontSize: 150, lineHeight: 180 }}>{item.emoji}</Text>
              <Text
                variant="display"
                color={item.fg}
                style={{ position: 'absolute', left: 22, top: 18, fontSize: 64, lineHeight: 66, opacity: 0.9 }}
              >
                {tr(`onboarding.big${i + 1}`)}
              </Text>
            </View>
            <Text variant="h1">{tr(`onboarding.title${i + 1}`)}</Text>
            <Text tone="textSecondary" style={{ marginTop: t.spacing.sm }}>
              {tr(`onboarding.body${i + 1}`)}
            </Text>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.lg, gap: t.spacing.xl }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((s, i) => (
            <View key={s.key} style={{ height: 6, width: i === index ? 26 : 6, borderRadius: 3, backgroundColor: i === index ? t.colors.textPrimary : t.colors.borderStrong }} />
          ))}
        </View>
        <Button title={index === SLIDES.length - 1 ? tr('onboarding.start') : tr('common.next')} onPress={next} size="lg" variant="dark" />
      </View>
    </Screen>
  );
}
