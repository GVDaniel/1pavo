import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Card, Chip, Header, Input, Rating, Screen, Text } from '@/components';
import { useCurrentTenant, useOrder, useRateOrder } from '@/hooks/queries';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { formatPrice } from '@/utils/format';

const TIPS = [0, 1, 2, 3];

export default function Rate() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order } = useOrder(id);
  const tenant = useCurrentTenant();
  const rate = useRateOrder();
  const [delivery, setDelivery] = useState(0);
  const [products, setProducts] = useState(0);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(0);

  const submit = async () => {
    await rate.mutateAsync({ id: id!, delivery, products, comment: comment || undefined, tip: tip || undefined });
    toast(tr('rate.thanks'), 'success');
    router.replace('/(tabs)/orders');
  };

  return (
    <Screen>
      <Header close title={tr('rate.title')} subtitle={order?.code} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: 48, gap: t.spacing.lg }} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: t.spacing.md, alignItems: 'center' }}>
          <Text variant="h3">{tr('rate.delivery', { name: order?.courier?.name ?? '' })}</Text>
          <Rating value={delivery} onChange={setDelivery} />
        </Card>
        <Card style={{ gap: t.spacing.md, alignItems: 'center' }}>
          <Text variant="h3">{tr('rate.products')}</Text>
          <Rating value={products} onChange={setProducts} />
        </Card>
        <Input label={tr('rate.comment')} value={comment} onChangeText={setComment} placeholder={tr('rate.commentPlaceholder')} multiline style={{ minHeight: 90, textAlignVertical: 'top' }} />
        {tenant.data?.config.features.tips && (
          <View style={{ gap: t.spacing.md }}>
            <Text variant="h3">{tr('rate.tip')}</Text>
            <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
              {TIPS.map((v) => (
                <Chip key={v} label={v ? formatPrice(v) : tr('checkout.noTip')} selected={tip === v} onPress={() => setTip(v)} />
              ))}
            </View>
          </View>
        )}
        <Button title={tr('rate.submit')} size="lg" disabled={!delivery || !products} loading={rate.isPending} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}
