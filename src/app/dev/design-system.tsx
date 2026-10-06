import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Countdown,
  EmptyState,
  Header,
  Input,
  Logo,
  OrderStepper,
  PriceTag,
  ProductCard,
  ProductCardSkeleton,
  QuantityStepper,
  Rating,
  Screen,
  Segmented,
  Text,
  TextVariant,
} from '@/components';
import { toStoreProduct } from '@/api/mock/catalog';
import { products } from '@/mocks/products';
import { usePrefsStore } from '@/store/prefsStore';
import { palette } from '@/theme/tokens';
import { ColorKey, useTheme } from '@/theme/ThemeProvider';

/** Catálogo visual de tokens y componentes: útil para validar un cambio de paleta. */
export default function DesignSystem() {
  const t = useTheme();
  const setMode = usePrefsStore((s) => s.setThemeMode);
  const [qty, setQty] = useState(2);
  const [seg, setSeg] = useState<'a' | 'b'>('a');
  const [check, setCheck] = useState(true);
  const [rating, setRating] = useState(4);
  const sample = [toStoreProduct(products[3], 's-demo'), toStoreProduct(products[40], 's-demo')];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ gap: t.spacing.md }}>
      <Text variant="h2">{title}</Text>
      {children}
    </View>
  );

  const baseColors = Object.entries(palette).filter(([, v]) => typeof v === 'string') as [string, string][];
  const semantic = Object.keys(t.colors) as ColorKey[];
  const variants = Object.keys(t.type) as TextVariant[];

  return (
    <Screen>
      <Header title="Design system" subtitle="src/theme/tokens.ts" />
      <ScrollView contentContainerStyle={{ padding: t.spacing.lg, paddingBottom: 64, gap: t.spacing.xxxl }}>
        <Segmented
          value={t.isDark ? 'dark' : 'light'}
          onChange={(v) => setMode(v as 'light' | 'dark')}
          options={[
            { key: 'light', label: 'Claro' },
            { key: 'dark', label: 'Oscuro' },
          ]}
        />

        <Section title="Marca">
          <Logo size={40} />
        </Section>

        <Section title="Paleta base">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
            {baseColors.map(([k, v]) => (
              <View key={k} style={{ width: 96, gap: 4 }}>
                <View style={{ height: 56, borderRadius: t.radius.md, backgroundColor: v, borderWidth: 1, borderColor: t.colors.border }} />
                <Text variant="caption">{k}</Text>
                <Text variant="caption" tone="textMuted">
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Tokens semánticos">
          {semantic.map((k) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.colors[k], borderWidth: 1, borderColor: t.colors.border }} />
              <Text variant="smallStrong" style={{ flex: 1 }}>
                {k}
              </Text>
              <Text variant="caption" tone="textMuted">
                {t.colors[k]}
              </Text>
            </View>
          ))}
        </Section>

        <Section title="Tipografía">
          {variants.map((v) => (
            <Text key={v} variant={v}>
              {`${v}: Pan recién hecho a las 4:00`}
            </Text>
          ))}
        </Section>

        <Section title="Etiquetas de precio">
          <View style={{ flexDirection: 'row', gap: t.spacing.xl, alignItems: 'center', flexWrap: 'wrap' }}>
            <PriceTag price={1.2} size="sm" />
            <PriceTag price={5.99} oldPrice={6.6} />
            <PriceTag price={12.5} size="lg" />
          </View>
        </Section>

        <Section title="Botones">
          <Button title="Pedir ahora" />
          <Button title="Ir a pagar" variant="dark" icon="lock-closed" />
          <Button title="Cambiar dirección" variant="secondary" />
          <Button title="Seguir sin cuenta" variant="ghost" />
          <Button title="Eliminar cuenta" variant="danger" />
          <Button title="Cargando" loading />
          <Button title="Desactivado" disabled />
        </Section>

        <Section title="Chips, badges y controles">
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
            <Chip label="Todo" selected />
            <Chip label="Refrescos" />
            <Chip label="hielo" icon="time-outline" size="sm" />
          </View>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
            <Badge label="-20 %" tone="accent" />
            <Badge label="Nuevo" tone="sun" />
            <Badge label="+18" tone="dark" />
            <Badge label="Entregado" tone="success" />
            <Badge label="Vegano" />
          </View>
          <View style={{ flexDirection: 'row', gap: t.spacing.lg, alignItems: 'center' }}>
            <QuantityStepper value={qty} onIncrement={() => setQty(qty + 1)} onDecrement={() => setQty(Math.max(0, qty - 1))} />
            <Countdown to={new Date(Date.now() + 3_600_000).toISOString()} />
          </View>
          <Segmented value={seg} onChange={setSeg} options={[{ key: 'a', label: 'Activos' }, { key: 'b', label: 'Historial' }]} />
          <Checkbox checked={check} onChange={setCheck} label="Confirmo que soy mayor de edad" />
          <Rating value={rating} onChange={setRating} />
          <Input label="Código promocional" placeholder="BIENVENIDA" icon="pricetag-outline" />
          <Input label="Con error" value="28" error="El código postal tiene 5 cifras" />
        </Section>

        <Section title="Producto">
          <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
            <ProductCard product={sample[0]} width={160} />
            <ProductCardSkeleton width={160} />
          </View>
          <ProductCard product={sample[1]} width={160} />
        </Section>

        <Section title="Seguimiento">
          <Card>
            <OrderStepper status="preparing" />
          </Card>
        </Section>

        <Section title="Estado vacío">
          <Card>
            <EmptyState emoji="🛒" title="Tu cesta está vacía" message="Añade algo y te lo llevamos en minutos." action="Explorar" />
          </Card>
        </Section>
      </ScrollView>
    </Screen>
  );
}
