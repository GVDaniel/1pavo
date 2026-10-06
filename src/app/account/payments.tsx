import React, { useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api';
import { Badge, BottomSheet, Button, Card, EmptyState, Header, Icon, IconButton, Input, Screen, Skeleton, Text } from '@/components';
import { useAddCard, usePaymentMethods, useRemovePaymentMethod } from '@/hooks/queries';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';

const luhn = (num: string) => {
  const d = num.replace(/\D/g, '');
  if (d.length < 13) return false;
  let sum = 0;
  let dbl = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

const formatCard = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function Payments() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { data, isLoading } = usePaymentMethods();
  const remove = useRemovePaymentMethod();
  const [sheet, setSheet] = useState(false);

  return (
    <Screen>
      <Header title={tr('payments.title')} />
      <FlatList
        data={data ?? []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.sm, paddingBottom: 120 }}
        ListEmptyComponent={isLoading ? <Skeleton height={76} /> : <EmptyState emoji="💳" title={tr('payments.emptyTitle')} />}
        ListFooterComponent={
          <Text variant="caption" tone="textMuted" style={{ marginTop: t.spacing.lg }}>
            {tr('payments.wallets')}
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <View style={{ width: 48, height: 32, borderRadius: 6, backgroundColor: item.brand === 'visa' ? '#1A1F71' : '#141726', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="card" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{`${item.label} ···· ${item.last4}`}</Text>
              <Text variant="caption" tone="textSecondary">
                {tr('checkout.expires', { date: item.expiry })}
              </Text>
            </View>
            {item.isDefault && <Badge label={tr('addresses.default')} tone="sun" />}
            <IconButton
              icon="trash-outline"
              variant="plain"
              accessibilityLabel={tr('payments.remove')}
              onPress={() =>
                Alert.alert(tr('payments.removeTitle'), `${item.label} ···· ${item.last4}`, [
                  { text: tr('common.cancel'), style: 'cancel' },
                  { text: tr('payments.remove'), style: 'destructive', onPress: () => remove.mutate(item.id) },
                ])
              }
            />
          </Card>
        )}
      />
      <View style={{ position: 'absolute', left: t.spacing.lg, right: t.spacing.lg, bottom: 32 }}>
        <Button title={tr('payments.add')} icon="add" variant="dark" size="lg" onPress={() => setSheet(true)} />
      </View>
      <AddCardSheet visible={sheet} onClose={() => setSheet(false)} />
    </Screen>
  );
}

function AddCardSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const add = useAddCard();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [holder, setHolder] = useState('');
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string>();

  const [mm, yy] = expiry.split('/').map(Number);
  const now = new Date();
  const expiryValid = mm >= 1 && mm <= 12 && !!yy && (2000 + yy > now.getFullYear() || (2000 + yy === now.getFullYear() && mm >= now.getMonth() + 1));
  const errors = {
    number: !luhn(number) ? tr('payments.errNumber') : undefined,
    expiry: !expiryValid ? tr('payments.errExpiry') : undefined,
    cvc: !/^\d{3,4}$/.test(cvc) ? tr('payments.errCvc') : undefined,
    holder: holder.trim().length < 3 ? tr('payments.errHolder') : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const save = async () => {
    setTouched(true);
    setServerError(undefined);
    if (!valid) return;
    try {
      await add.mutateAsync({ number, expiry, cvc, holder });
      toast(tr('payments.saved'), 'success');
      setNumber('');
      setExpiry('');
      setCvc('');
      setHolder('');
      setTouched(false);
      onClose();
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : tr('errors.generic'));
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={tr('payments.new')}>
      <View style={{ gap: t.spacing.md, paddingBottom: t.spacing.lg }}>
        <Input label={tr('payments.number')} value={number} onChangeText={(v) => setNumber(formatCard(v))} keyboardType="number-pad" placeholder="4242 4242 4242 4242" icon="card-outline" error={touched ? errors.number : undefined} autoComplete="cc-number" />
        <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input label={tr('payments.expiry')} value={expiry} onChangeText={(v) => setExpiry(formatExpiry(v))} keyboardType="number-pad" placeholder="MM/AA" error={touched ? errors.expiry : undefined} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="CVC" value={cvc} onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry placeholder="123" error={touched ? errors.cvc : undefined} />
          </View>
        </View>
        <Input label={tr('payments.holder')} value={holder} onChangeText={setHolder} autoCapitalize="words" error={touched ? errors.holder : undefined} autoComplete="cc-name" />
        {!!serverError && (
          <Text variant="smallStrong" tone="error">
            {serverError}
          </Text>
        )}
        <Text variant="caption" tone="textMuted">
          {tr('payments.testHint')}
        </Text>
        <Button title={tr('payments.save')} variant="dark" size="lg" icon="lock-closed" loading={add.isPending} onPress={save} />
      </View>
    </BottomSheet>
  );
}
