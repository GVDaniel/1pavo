import React, { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export function OTPInput({
  value,
  onChange,
  length = 6,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  error?: boolean;
}) {
  const t = useTheme();
  const ref = useRef<TextInput>(null);
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityLabel="Código de verificación">
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, justifyContent: 'space-between' }}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i];
          const active = i === value.length;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                aspectRatio: 0.82,
                borderRadius: t.radius.md,
                borderWidth: 1.5,
                borderColor: error ? t.colors.error : active ? t.colors.textPrimary : t.colors.border,
                backgroundColor: char ? t.colors.highlight : t.colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="h1">{char ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        maxLength={length}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
      />
    </Pressable>
  );
}
