import React from 'react';
import { FlatList, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { StoreProduct } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './Skeleton';

const CARD_W = 148;

/** Carril horizontal de productos */
export function ProductRail({ data, loading }: { data?: StoreProduct[]; loading?: boolean }) {
  const t = useTheme();
  if (loading || !data) {
    return (
      <View style={{ flexDirection: 'row', gap: t.spacing.md, paddingHorizontal: t.spacing.lg }}>
        {[0, 1, 2].map((i) => (
          <ProductCardSkeleton key={i} width={CARD_W} />
        ))}
      </View>
    );
  }
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(p) => p.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md }}
      renderItem={({ item }) => <ProductCard product={item} width={CARD_W} />}
    />
  );
}
