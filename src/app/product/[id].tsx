import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  goBack,
  Icon,
  IconButton,
  PriceTag,
  ProductImage,
  ProductRail,
  QuantityStepper,
  SectionHeader,
  Skeleton,
  Text,
} from '@/components';
import { useCategoryHue } from '@/hooks/useCategoryHue';
import { useProduct, useRelated } from '@/hooks/queries';
import { useCartQuantity, useCartStore } from '@/store/cartStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { discountPct, formatPrice } from '@/utils/format';
import { hapticSuccess } from '@/utils/haptics';

export default function ProductDetail() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: p, isLoading, isError, refetch } = useProduct(id);
  const related = useRelated(id);
  const hue = useCategoryHue(p?.categoryId);
  const inCart = useCartQuantity(id ?? '');
  const add = useCartStore((s) => s.add);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const [qty, setQty] = useState(1);
  const [nutritionOpen, setNutritionOpen] = useState(false);

  useEffect(() => {
    if (inCart) setQty(inCart);
  }, [inCart]);

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.background, paddingTop: insets.top + 16 }}>
        <ErrorState onRetry={refetch} />
      </View>
    );
  }

  const confirm = () => {
    if (!p) return;
    if (inCart) setQuantity(p.id, qty);
    else add(p, qty);
    hapticSuccess();
    toast(inCart ? tr('product.updated') : tr('product.added', { count: qty, name: p.name }), 'success');
    goBack();
  };

  const pct = p ? discountPct(p.price, p.oldPrice) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: t.spacing.lg, paddingTop: t.spacing.lg }}>
          {p ? (
            <ProductImage emoji={p.emoji} hue={hue} image={p.image} height={width - t.spacing.lg * 2} radius={t.radius.xl} />
          ) : (
            <Skeleton height={width - t.spacing.lg * 2} radius={t.radius.xl} />
          )}
          <IconButton icon="close" variant="glass" accessibilityLabel={tr('common.close')} onPress={goBack} style={{ position: 'absolute', top: t.spacing.xl + 4, right: t.spacing.xl + 4 }} />
        </View>

        {isLoading || !p ? (
          <View style={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md }}>
            <Skeleton width={90} height={36} />
            <Skeleton width="80%" height={28} />
            <Skeleton width="40%" height={16} />
          </View>
        ) : (
          <View style={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {pct > 0 && <Badge tone="accent" label={`-${pct} %`} />}
              {p.tags
                .filter((tag) => tag !== 'oferta' && tag !== 'mas18')
                .map((tag) => (
                  <Badge key={tag} label={tr(`tags.${tag}`)} tone={tag === 'nuevo' ? 'sun' : 'muted'} />
                ))}
              {p.ageRestricted && <Badge tone="dark" label="+18" />}
            </View>

            <PriceTag price={p.price} oldPrice={p.oldPrice} size="lg" />

            <View style={{ gap: 4 }}>
              <Text variant="h1">{p.name}</Text>
              <Text variant="bodyMedium" tone="textSecondary">
                {p.format}
              </Text>
              {p.available && p.stock <= 5 && (
                <Text variant="smallStrong" tone="accent" style={{ marginTop: 4 }}>
                  {tr('product.lowStock', { count: p.stock })}
                </Text>
              )}
            </View>

            <Text tone="textSecondary">{p.description}</Text>

            {p.ageRestricted && (
              <Card tone="highlight" style={{ flexDirection: 'row', gap: t.spacing.md }}>
                <Icon name="id-card-outline" size={22} color={t.colors.textPrimary} />
                <Text variant="small" style={{ flex: 1 }}>
                  {tr('product.ageNotice')}
                </Text>
              </Card>
            )}

            {p.nutrition && (
              <Card style={{ paddingVertical: t.spacing.md }}>
                <Pressable onPress={() => setNutritionOpen((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} accessibilityRole="button" accessibilityState={{ expanded: nutritionOpen }}>
                  <Text variant="bodyStrong">{tr('product.nutrition')}</Text>
                  <Icon name={nutritionOpen ? 'chevron-up' : 'chevron-down'} size={18} color={t.colors.textSecondary} />
                </Pressable>
                {nutritionOpen && (
                  <View style={{ marginTop: t.spacing.md, gap: 8 }}>
                    <Text variant="caption" tone="textMuted">
                      {tr('product.per100')}
                    </Text>
                    {(
                      [
                        ['kcal', `${p.nutrition.kcal} kcal`],
                        ['fat', `${p.nutrition.fat} g`],
                        ['carbs', `${p.nutrition.carbs} g`],
                        ['sugar', `${p.nutrition.sugar} g`],
                        ['protein', `${p.nutrition.protein} g`],
                        ['salt', `${p.nutrition.salt} g`],
                      ] as const
                    ).map(([k, v]) => (
                      <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text variant="small" tone="textSecondary">
                          {tr(`product.nutri.${k}`)}
                        </Text>
                        <Text variant="smallStrong">{v}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            )}

            {!!p.allergens?.length && (
              <View style={{ gap: t.spacing.sm }}>
                <Text variant="bodyStrong">{tr('product.allergens')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {p.allergens.map((a) => (
                    <Badge key={a} label={a} />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ marginTop: t.spacing.xxxl }}>
          <SectionHeader title={tr('product.related')} />
          <ProductRail data={related.data} loading={related.isLoading} />
        </View>
      </ScrollView>

      {p && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.spacing.md,
            paddingHorizontal: t.spacing.lg,
            paddingTop: t.spacing.md,
            paddingBottom: Math.max(insets.bottom, t.spacing.lg),
            backgroundColor: t.colors.surface,
            borderTopWidth: 1,
            borderTopColor: t.colors.border,
          }}
        >
          {p.available ? (
            <>
              <QuantityStepper size="lg" value={qty} max={p.stock} trashAtOne={false} onIncrement={() => setQty((q) => q + 1)} onDecrement={() => setQty((q) => Math.max(1, q - 1))} />
              <View style={{ flex: 1 }}>
                <Button
                  title={inCart ? tr('product.update', { price: formatPrice(p.price * qty) }) : tr('product.add', { price: formatPrice(p.price * qty) })}
                  size="lg"
                  onPress={confirm}
                />
              </View>
            </>
          ) : (
            <View style={{ flex: 1 }}>
              <Button title={tr('product.soldOutCta')} variant="secondary" size="lg" onPress={() => router.push(`/category/${p.categoryId}`)} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
