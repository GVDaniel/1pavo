import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { StoreStatus } from '@/types';
import { initials } from '@/utils/format';
import { hapticSelect } from '@/utils/haptics';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

export function Divider({ spacing = 16 }: { spacing?: number }) {
  const t = useTheme();
  return <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: spacing }} />;
}

export function Avatar({ first, last, size = 56 }: { first: string; last?: string; size?: number }) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.colors.cta, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: t.fonts.display, fontSize: size * 0.38, color: t.colors.ctaText }}>{initials(first, last)}</Text>
    </View>
  );
}

export function StoreStatusBadge({ status }: { status: StoreStatus }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const color = status === 'open' ? t.colors.success : status === 'busy' ? t.colors.warning : t.colors.error;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text variant="caption" tone="textSecondary">
        {tr(`store.status.${status}`)}
      </Text>
    </View>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  danger,
  chevron = true,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
}) {
  const t = useTheme();
  const color = danger ? t.colors.error : t.colors.textPrimary;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: 14, opacity: pressed ? 0.6 : 1 })}
    >
      {icon && (
        <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: danger ? t.colors.accentSoft : t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={19} color={color} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" color={color}>
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="caption" tone="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
      {chevron && onPress && <Icon name="chevron-forward" size={18} color={t.colors.textMuted} />}
    </Pressable>
  );
}

export function Rating({ value, onChange, size = 34 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="adjustable" accessibilityValue={{ min: 0, max: 5, now: value }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          disabled={!onChange}
          accessibilityLabel={`${n}`}
          onPress={() => {
            hapticSelect();
            onChange?.(n);
          }}
          hitSlop={4}
        >
          <Icon name={n <= value ? 'star' : 'star-outline'} size={size} color={n <= value ? t.colors.cta : t.colors.borderStrong} />
        </Pressable>
      ))}
    </View>
  );
}

export function Countdown({ to }: { to: string }) {
  const t = useTheme();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(to).getTime() - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.colors.accent, borderRadius: t.radius.pill, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Icon name="flash" size={13} color={t.colors.accentText} />
      <Text variant="smallStrong" color={t.colors.accentText} style={{ fontVariant: ['tabular-nums'] }}>
        {`${pad(h)}:${pad(m)}:${pad(s)}`}
      </Text>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.pill, padding: 4 }}>
      {options.map((o) => {
        const sel = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: sel }}
            onPress={() => {
              hapticSelect();
              onChange(o.key);
            }}
            style={{ flex: 1, height: 38, borderRadius: t.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? t.colors.surface : 'transparent', ...(sel ? t.shadow.sm : {}) }}
          >
            <Text variant="smallStrong" tone={sel ? 'textPrimary' : 'textSecondary'}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RadioRow({
  selected,
  onPress,
  title,
  subtitle,
  icon,
  disabled,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  icon?: IconName;
  disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => {
        hapticSelect();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.md,
        padding: t.spacing.md,
        borderRadius: t.radius.md,
        borderWidth: 1.5,
        borderColor: selected ? t.colors.textPrimary : t.colors.border,
        backgroundColor: t.colors.surface,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {icon && <Icon name={icon} size={22} color={t.colors.textPrimary} />}
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{title}</Text>
        {!!subtitle && (
          <Text variant="caption" tone="textSecondary">
            {subtitle}
          </Text>
        )}
      </View>
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? t.colors.textPrimary : t.colors.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
        {selected && <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: t.colors.textPrimary }} />}
      </View>
    </Pressable>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => {
        hapticSelect();
        onChange(!checked);
      }}
      style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'flex-start' }}
    >
      <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: checked ? t.colors.textPrimary : t.colors.borderStrong, backgroundColor: checked ? t.colors.ctaStrong : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {checked && <Icon name="checkmark" size={16} color={t.colors.ctaStrongText} />}
      </View>
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SummaryRow({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant={strong ? 'h3' : 'body'} tone={strong ? 'textPrimary' : 'textSecondary'}>
        {label}
      </Text>
      <Text variant={strong ? 'h3' : 'bodyMedium'} tone={accent ? 'accent' : 'textPrimary'}>
        {value}
      </Text>
    </View>
  );
}
