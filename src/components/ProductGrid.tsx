import React from 'react';
import { FlatList, RefreshControl, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { StoreProduct } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './Skeleton';

type Props = {
  data?: StoreProduct[];
  loading?: boolean;
  header?: React.ReactElement | null;
  empty?: React.ReactElement | null;
  bottomSpace?: number;
  highlight?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function useGridWidth() {
  const { width } = useWindowDimensions();
  const t = useTheme();
  return (width - t.spacing.lg * 2 - t.spacing.md) / 2;
}

export function ProductGrid({ data, loading, header, empty, bottomSpace = 120, highlight, onRefresh, refreshing }: Props) {
  const t = useTheme();
  const w = useGridWidth();
  if (loading || !data) {
    return (
      <View style={{ paddingHorizontal: t.spacing.lg }}>
        {header}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md }}>
          {[0, 1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} width={w} />
          ))}
        </View>
      </View>
    );
  }
  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      columnWrapperStyle={{ gap: t.spacing.md }}
      contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.xl, paddingBottom: bottomSpace }}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.colors.textMuted} /> : undefined
      }
      renderItem={({ item }) => <ProductCard product={item} width={w} highlight={highlight} />}
    />
  );
}
