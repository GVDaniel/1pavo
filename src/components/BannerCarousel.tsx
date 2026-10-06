import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Banner } from '@/types';
import { Text } from './Text';

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const w = width - t.spacing.lg * 2;
  const [index, setIndex] = useState(0);

  const open = (b: Banner) => {
    if (b.target?.type === 'category') router.push(`/category/${b.target.id}`);
    else if (b.target?.type === 'promo') router.push('/account/coupons');
    else router.push('/search');
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={w + t.spacing.md}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md }}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / (w + t.spacing.md)))}
        scrollEventThrottle={32}
      >
        {banners.map((b) => (
          <Pressable
            key={b.id}
            accessibilityRole="button"
            accessibilityLabel={`${b.title.replace('\n', ' ')}. ${b.subtitle}`}
            onPress={() => open(b)}
            style={{
              width: w,
              height: 176,
              borderRadius: t.radius.xl,
              backgroundColor: b.background,
              padding: t.spacing.xl,
              overflow: 'hidden',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ maxWidth: w * 0.68 }}>
              <Text variant="h1" color={b.foreground} style={{ fontSize: 26, lineHeight: 28 }}>
                {b.title}
              </Text>
              <Text variant="small" color={b.foreground} style={{ opacity: 0.85, marginTop: 6 }} numberOfLines={2}>
                {b.subtitle}
              </Text>
            </View>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: b.foreground,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: t.radius.pill,
              }}
            >
              <Text variant="smallStrong" color={b.background}>
                {b.cta}
              </Text>
            </View>
            <Text
              accessible={false}
              style={{ position: 'absolute', right: -8, bottom: -18, fontSize: 108, lineHeight: 130, transform: [{ rotate: '14deg' }] }}
            >
              {b.emoji}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: t.spacing.md }}>
        {banners.map((b, i) => (
          <View
            key={b.id}
            style={{
              width: i === index ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === index ? t.colors.textPrimary : t.colors.borderStrong,
            }}
          />
        ))}
      </View>
    </View>
  );
}
