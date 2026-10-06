import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, Card, Checkbox, EmptyState, Header, Icon, Input, Screen, Skeleton, Text, Badge } from '@/components';
import { useSwitchLocation } from '@/features/tenant/useSwitchLocation';
import { useAddAddress, useAddresses, useCurrentTenant, useRemoveAddress, useSetDefaultAddress } from '@/hooks/queries';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { Address } from '@/types';

export default function Addresses() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { data, isLoading } = useAddresses();
  const remove = useRemoveAddress();
  const setDefault = useSetDefaultAddress();
  const current = useTenantStore((s) => s.deliveryAddress);
  const { switchTo } = useSwitchLocation();
  const [sheet, setSheet] = useState(false);

  const use = async (a: Address) => {
    const r = await switchTo({ label: a.label, street: a.street, location: a.location, addressId: a.id });
    if (r === 'ok') {
      toast(tr('addresses.using', { label: a.label }), 'success');
      router.back();
    } else router.push({ pathname: '/no-coverage', params: { reason: r } });
  };

  const actions = (a: Address) =>
    Alert.alert(a.label, a.street, [
      { text: tr('addresses.useThis'), onPress: () => use(a) },
      { text: tr('addresses.makeDefault'), onPress: () => setDefault.mutate(a.id) },
      { text: tr('addresses.delete'), style: 'destructive', onPress: () => remove.mutate(a.id) },
      { text: tr('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Screen>
      <Header title={tr('addresses.title')} />
      <FlatList
        data={data ?? []}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.sm, paddingBottom: 120 }}
        ListEmptyComponent={
          isLoading ? (
            <Skeleton height={80} />
          ) : (
            <EmptyState emoji="🏠" title={tr('addresses.emptyTitle')} message={tr('addresses.emptyBody')} />
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => use(item)} onLongPress={() => actions(item)} accessibilityRole="button" accessibilityHint={tr('addresses.hint')}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, borderWidth: current?.addressId === item.id ? 1.5 : 0, borderColor: t.colors.textPrimary }}>
              <Icon name={item.label === 'Casa' ? 'home-outline' : item.label === 'Trabajo' ? 'briefcase-outline' : 'location-outline'} size={22} color={t.colors.textPrimary} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' }}>
                  <Text variant="bodyStrong">{item.label}</Text>
                  {item.isDefault && <Badge label={tr('addresses.default')} tone="sun" />}
                </View>
                <Text variant="small" tone="textSecondary">
                  {[item.street, item.details, `${item.postalCode} ${item.city}`].filter(Boolean).join(', ')}
                </Text>
              </View>
              <Pressable onPress={() => actions(item)} hitSlop={10} accessibilityLabel={tr('addresses.more')}>
                <Icon name="ellipsis-horizontal" size={20} color={t.colors.textSecondary} />
              </Pressable>
            </Card>
          </Pressable>
        )}
      />
      <View style={{ position: 'absolute', left: t.spacing.lg, right: t.spacing.lg, bottom: 32 }}>
        <Button title={tr('addresses.add')} icon="add" variant="dark" size="lg" onPress={() => setSheet(true)} />
      </View>
      <AddAddressSheet visible={sheet} onClose={() => setSheet(false)} />
    </Screen>
  );
}

function AddAddressSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const add = useAddAddress();
  const tenant = useCurrentTenant();
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [details, setDetails] = useState('');
  const [postal, setPostal] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = {
    street: street.trim().length < 5 ? tr('addresses.errStreet') : undefined,
    postal: !/^\d{5}$/.test(postal) ? tr('addresses.errPostal') : undefined,
  };
  const valid = !errors.street && !errors.postal;

  const save = async () => {
    setTouched(true);
    if (!valid || !tenant.data) return;
    // TODO(backend): geocodificar la dirección. En mock se coloca cerca del centro de la ciudad.
    const c = tenant.data.center;
    await add.mutateAsync({
      label: label.trim() || tr('addresses.otherLabel'),
      street: street.trim(),
      details: details.trim() || undefined,
      postalCode: postal,
      city: tenant.data.name,
      instructions: instructions.trim() || undefined,
      location: { latitude: c.latitude + (Math.random() - 0.5) * 0.01, longitude: c.longitude + (Math.random() - 0.5) * 0.01 },
      isDefault,
    });
    toast(tr('addresses.saved'), 'success');
    setLabel('');
    setStreet('');
    setDetails('');
    setPostal('');
    setInstructions('');
    setTouched(false);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={tr('addresses.new')}>
      <View style={{ gap: t.spacing.md, paddingBottom: t.spacing.lg }}>
        <Input label={tr('addresses.label')} value={label} onChangeText={setLabel} placeholder={tr('addresses.labelPlaceholder')} />
        <Input label={tr('addresses.street')} value={street} onChangeText={setStreet} placeholder="C/ Mayor, 12" error={touched ? errors.street : undefined} />
        <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input label={tr('addresses.details')} value={details} onChangeText={setDetails} placeholder="3º B" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label={tr('addresses.postal')} value={postal} onChangeText={setPostal} keyboardType="number-pad" maxLength={5} error={touched ? errors.postal : undefined} />
          </View>
        </View>
        <Input label={tr('addresses.instructions')} value={instructions} onChangeText={setInstructions} placeholder={tr('addresses.instructionsPlaceholder')} />
        <Checkbox checked={isDefault} onChange={setIsDefault} label={tr('addresses.setDefault')} />
        <Button title={tr('addresses.save')} variant="dark" size="lg" loading={add.isPending} onPress={save} />
      </View>
    </BottomSheet>
  );
}
