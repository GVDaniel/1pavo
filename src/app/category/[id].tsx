import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, Card, Chip, EmptyState, ErrorState, Header, IconButton, ProductGrid, RadioRow, Screen, TAB_BAR_SPACE, Text } from '@/components';
import { FloatingCartBar } from '@/components/FloatingCartBar';
import { useCategories, useCurrentTenant, useProducts } from '@/hooks/queries';
import { useTheme } from '@/theme/ThemeProvider';
import { ProductSort, ProductTag } from '@/types';
import { canSellAlcohol } from '@/utils/time';

const SORTS: ProductSort[] = ['relevance', 'price_asc', 'price_desc', 'offers'];
const FILTERS: ProductTag[] = ['oferta', 'vegano', 'sin_gluten', 'frio', 'recien_hecho'];

export default function CategoryScreen() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { id, sub } = useLocalSearchParams<{ id: string; sub?: string }>();
  const cats = useCategories();
  const tenant = useCurrentTenant();
  const category = cats.data?.find((c) => c.id === id);
  const [subId, setSubId] = useState<string | undefined>(sub);
  const [sort, setSort] = useState<ProductSort>('relevance');
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [sheet, setSheet] = useState(false);
  const insets = useSafeAreaInsets();

  const products = useProducts({ categoryId: id, subcategoryId: subId, sort, tags });
  const activeFilters = tags.length + (sort !== 'relevance' ? 1 : 0);
  const alcoholBlocked = category?.ageRestricted && tenant.data && !canSellAlcohol(tenant.data.config.alcohol);

  return (
    <Screen>
      <Header
        title={category ? `${category.emoji}  ${category.name}` : ''}
        right={<IconButton icon="options-outline" accessibilityLabel={tr('category.filters')} dot={activeFilters > 0} onPress={() => setSheet(true)} />}
      />
      {!!category?.subcategories.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.sm, paddingBottom: t.spacing.md }} style={{ flexGrow: 0 }}>
          <Chip label={tr('category.all')} selected={!subId} onPress={() => setSubId(undefined)} />
          {category.subcategories.map((s) => (
            <Chip key={s.id} label={s.name} selected={subId === s.id} onPress={() => setSubId(s.id)} />
          ))}
        </ScrollView>
      )}

      {products.isError ? (
        <ErrorState onRetry={products.refetch} />
      ) : (
        <ProductGrid
          data={products.data}
          loading={products.isLoading}
          bottomSpace={TAB_BAR_SPACE - 60}
          onRefresh={products.refetch}
          refreshing={products.isRefetching}
          header={
            category?.ageRestricted ? (
              <Card tone={alcoholBlocked ? 'accent' : 'highlight'} style={{ marginBottom: t.spacing.lg }}>
                <Text variant="smallStrong">
                  {alcoholBlocked
                    ? tr('category.alcoholBlocked', { from: tenant.data?.config.alcohol.allowedFrom, to: tenant.data?.config.alcohol.allowedTo })
                    : tr('category.alcoholNotice')}
                </Text>
              </Card>
            ) : null
          }
          empty={<EmptyState emoji="🫙" title={tr('category.emptyTitle')} message={tr('category.emptyBody')} action={tr('category.clearFilters')} onAction={() => { setTags([]); setSubId(undefined); }} />}
        />
      )}

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 16) }} pointerEvents="box-none">
        <FloatingCartBar />
      </View>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title={tr('category.filters')}>
        <View style={{ gap: t.spacing.sm }}>
          <Text variant="h3" style={{ marginBottom: t.spacing.xs }}>
            {tr('category.sortBy')}
          </Text>
          {SORTS.map((s) => (
            <RadioRow key={s} title={tr(`category.sort.${s}`)} selected={sort === s} onPress={() => setSort(s)} />
          ))}
          <Text variant="h3" style={{ marginTop: t.spacing.lg, marginBottom: t.spacing.xs }}>
            {tr('category.filterBy')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
            {FILTERS.map((f) => (
              <Chip
                key={f}
                label={tr(`tags.${f}`)}
                selected={tags.includes(f)}
                onPress={() => setTags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.xl, marginBottom: t.spacing.lg }}>
            <Button title={tr('category.clear')} variant="secondary" full={false} style={{ flex: 1 }} onPress={() => { setTags([]); setSort('relevance'); }} />
            <Button title={tr('category.apply')} variant="dark" full={false} style={{ flex: 1 }} onPress={() => setSheet(false)} />
          </View>
        </View>
      </BottomSheet>
    </Screen>
  );
}
