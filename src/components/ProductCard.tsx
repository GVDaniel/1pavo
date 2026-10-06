import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCategoryHue } from '@/hooks/useCategoryHue';
import { makeStyles } from '@/theme/ThemeProvider';
import { StoreProduct } from '@/types';
import { discountPct } from '@/utils/format';
import { AddToCart } from './AddToCart';
import { Badge } from './Badge';
import { PriceTag } from './PriceTag';
import { ProductImage } from './ProductImage';
import { Text } from './Text';

export function ProductCard({ product, width, highlight }: { product: StoreProduct; width: number; highlight?: string }) {
  const s = useStyles();
  const { t } = useTranslation();
  const hue = useCategoryHue(product.categoryId);
  const pct = discountPct(product.price, product.oldPrice);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.format}`}
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [s.card, { width, opacity: pressed ? 0.85 : 1 }]}
    >
      <View>
        <ProductImage emoji={product.emoji} hue={hue} image={product.image} height={width * 0.92} />
        <View style={s.badges}>
          {pct > 0 && <Badge tone="accent" label={`-${pct} %`} />}
          {product.tags.includes('nuevo') && <Badge tone="sun" label={t('tags.nuevo')} />}
          {product.ageRestricted && <Badge tone="dark" label="+18" />}
        </View>
        {!product.available && (
          <View style={s.soldOut}>
            <Badge tone="dark" label={t('product.soldOut')} />
          </View>
        )}
        <View style={s.add}>
          <AddToCart product={product} />
        </View>
      </View>
      <View style={s.body}>
        <PriceTag price={product.price} oldPrice={product.oldPrice} size="sm" />
        <Text variant="smallStrong" numberOfLines={2} style={s.name}>
          {highlight ? <Highlighted text={product.name} term={highlight} /> : product.name}
        </Text>
        <Text variant="caption" tone="textMuted" numberOfLines={1}>
          {product.format}
        </Text>
      </View>
    </Pressable>
  );
}

function Highlighted({ text, term }: { text: string; term: string }) {
  const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const i = norm(text).indexOf(norm(term.trim()));
  if (i < 0 || !term.trim()) return <>{text}</>;
  const end = i + term.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <Text variant="smallStrong" tone="textPrimary" style={{ textDecorationLine: 'underline' }}>
        {text.slice(i, end)}
      </Text>
      {text.slice(end)}
    </>
  );
}

const useStyles = makeStyles((t) => ({
  card: { gap: t.spacing.sm },
  badges: { position: 'absolute', top: t.spacing.sm, left: t.spacing.sm, gap: 4 },
  soldOut: {
    ...{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: { position: 'absolute', right: t.spacing.sm, bottom: t.spacing.sm },
  body: { gap: 4, paddingHorizontal: 2 },
  name: { marginTop: 2 },
}));
