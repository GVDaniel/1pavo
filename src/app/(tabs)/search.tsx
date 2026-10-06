import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Chip, EmptyState, ErrorState, Icon, Input, ListRow, ProductGrid, TAB_BAR_SPACE, Text } from '@/components';
import { useCategories, useProducts, useTrendingSearches } from '@/hooks/queries';
import { usePrefsStore } from '@/store/prefsStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function Search() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const input = useRef<TextInput>(null);
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const recent = usePrefsStore((s) => s.recentSearches);
  const addRecent = usePrefsStore((s) => s.addRecentSearch);
  const clearRecent = usePrefsStore((s) => s.clearRecentSearches);
  const trending = useTrendingSearches();
  const cats = useCategories();

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  const searching = debounced.length >= 2;
  const results = useProducts({ query: debounced, limit: 60 }, searching);

  const apply = (term: string) => {
    setQ(term);
    addRecent(term);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md, paddingBottom: t.spacing.md, gap: t.spacing.md }}>
        <Text variant="h1">{tr('search.title')}</Text>
        <Input
          ref={input}
          value={q}
          onChangeText={setQ}
          icon="search"
          placeholder={tr('search.placeholder')}
          returnKeyType="search"
          autoCorrect={false}
          onSubmitEditing={() => addRecent(q)}
          accessibilityLabel={tr('search.title')}
          right={
            q ? (
              <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel={tr('search.clear')}>
                <Icon name="close-circle" size={20} color={t.colors.textMuted} />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      {searching ? (
        results.isError ? (
          <ErrorState onRetry={results.refetch} />
        ) : (
          <ProductGrid
            data={results.data}
            loading={results.isLoading}
            highlight={debounced}
            bottomSpace={TAB_BAR_SPACE}
            header={
              results.data?.length ? (
                <Text variant="small" tone="textSecondary" style={{ marginBottom: t.spacing.md }}>
                  {tr('search.results', { count: results.data.length })}
                </Text>
              ) : null
            }
            empty={<EmptyState emoji="🔎" title={tr('search.emptyTitle', { q: debounced })} message={tr('search.emptyBody')} />}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: TAB_BAR_SPACE, gap: t.spacing.xxl }} keyboardShouldPersistTaps="handled">
          {!!recent.length && (
            <View style={{ gap: t.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="h3">{tr('search.recent')}</Text>
                <Pressable onPress={clearRecent} hitSlop={8} accessibilityRole="button">
                  <Text variant="smallStrong" tone="textSecondary" style={{ textDecorationLine: 'underline' }}>
                    {tr('search.clearRecent')}
                  </Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
                {recent.map((r) => (
                  <Chip key={r} label={r} icon="time-outline" size="sm" onPress={() => apply(r)} />
                ))}
              </View>
            </View>
          )}

          <View style={{ gap: t.spacing.md }}>
            <Text variant="h3">{tr('search.trending')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
              {trending.data?.map((r) => (
                <Chip key={r} label={r} icon="trending-up" size="sm" onPress={() => apply(r)} />
              ))}
            </View>
          </View>

          <View>
            <Text variant="h3" style={{ marginBottom: t.spacing.xs }}>
              {tr('search.browse')}
            </Text>
            {cats.data?.map((c) => (
              <ListRow
                key={c.id}
                title={c.name}
                onPress={() => router.push(`/category/${c.id}`)}
                right={<Text style={{ fontSize: 22 }}>{c.emoji}</Text>}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
