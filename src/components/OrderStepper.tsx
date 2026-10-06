import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { OrderStatus } from '@/types';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

const STEPS: { key: OrderStatus; icon: IconName }[] = [
  { key: 'received', icon: 'receipt-outline' },
  { key: 'preparing', icon: 'basket-outline' },
  { key: 'on_the_way', icon: 'bicycle' },
  { key: 'delivered', icon: 'home-outline' },
];

export function OrderStepper({ status }: { status: OrderStatus }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const current = STEPS.findIndex((s) => s.key === status);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} accessible accessibilityLabel={tr(`orderStatus.${status}`)}>
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <React.Fragment key={step.key}>
            <View style={{ alignItems: 'center', width: 64, gap: 6 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done ? (active ? t.colors.cta : t.colors.ctaStrong) : t.colors.surfaceAlt,
                  borderWidth: active ? 3 : 0,
                  borderColor: t.colors.highlight,
                }}
              >
                <Icon
                  name={i < current ? 'checkmark' : step.icon}
                  size={18}
                  color={done ? (active ? t.colors.ctaText : t.colors.ctaStrongText) : t.colors.textMuted}
                />
              </View>
              <Text variant="caption" tone={done ? 'textPrimary' : 'textMuted'} align="center" numberOfLines={2}>
                {tr(`orderStatusShort.${step.key}`)}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={{ flex: 1, height: 3, borderRadius: 2, marginTop: 19, backgroundColor: i < current ? t.colors.ctaStrong : t.colors.surfaceAlt }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
