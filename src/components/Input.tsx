import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, icon, left, right, style, onFocus, onBlur, ...rest },
  ref,
) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const border = error ? t.colors.error : focused ? t.colors.textPrimary : t.colors.border;
  return (
    <View style={{ gap: 6 }}>
      {!!label && (
        <Text variant="smallStrong" tone="textSecondary">
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          borderRadius: t.radius.md,
          borderWidth: 1.5,
          borderColor: border,
          backgroundColor: t.colors.surface,
          paddingHorizontal: t.spacing.md,
          gap: t.spacing.sm,
        }}
      >
        {icon && <Icon name={icon} size={19} color={t.colors.textMuted} />}
        {left}
        <TextInput
          ref={ref}
          placeholderTextColor={t.colors.textMuted}
          selectionColor={t.colors.accent}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[t.type.bodyMedium, { flex: 1, color: t.colors.textPrimary, paddingVertical: 12 }, style]}
          accessibilityLabel={label}
          {...rest}
        />
        {right}
      </View>
      {!!(error || hint) && (
        <Text variant="caption" tone={error ? 'error' : 'textMuted'}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
});
