import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, repos } from '@/api';
import { Header, OTPInput, Screen, Text } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { hapticError, hapticSuccess } from '@/utils/haptics';

export default function Otp() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { phone = '', redirect } = useLocalSearchParams<{ phone: string; redirect?: string }>();
  const setSession = useAuthStore((s) => s.setSession);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  useEffect(() => {
    if (code.length !== 6) return;
    (async () => {
      setVerifying(true);
      setError(undefined);
      try {
        const s = await repos.auth.verifyOtp(phone, code);
        hapticSuccess();
        setSession(s);
        toast(tr('auth.welcome', { name: s.user.firstName }), 'success');
        router.dismiss(2); // cierra OTP y login
        if (redirect) router.push(redirect);
      } catch (e) {
        hapticError();
        setError(e instanceof ApiError ? e.message : tr('errors.generic'));
        setCode('');
      } finally {
        setVerifying(false);
      }
    })();
  }, [code, phone, redirect, setSession, tr]);

  return (
    <Screen edges={['top', 'bottom']}>
      <Header />
      <View style={{ paddingHorizontal: t.spacing.xl, gap: t.spacing.xl }}>
        <View style={{ gap: t.spacing.sm }}>
          <Text variant="h1">{tr('auth.otpTitle')}</Text>
          <Text tone="textSecondary">{tr('auth.otpBody', { phone })}</Text>
        </View>
        <OTPInput value={code} onChange={setCode} error={!!error} />
        {!!error && (
          <Text variant="smallStrong" tone="error">
            {error}
          </Text>
        )}
        {verifying && (
          <Text variant="small" tone="textSecondary">
            {tr('auth.verifying')}
          </Text>
        )}
        <Pressable
          disabled={seconds > 0}
          onPress={async () => {
            await repos.auth.requestOtp(phone);
            setSeconds(30);
            toast(tr('auth.codeResent'));
          }}
          accessibilityRole="button"
        >
          <Text variant="smallStrong" tone={seconds > 0 ? 'textMuted' : 'textPrimary'} style={{ textDecorationLine: seconds > 0 ? 'none' : 'underline' }}>
            {seconds > 0 ? tr('auth.resendIn', { seconds }) : tr('auth.resend')}
          </Text>
        </Pressable>
        <Text variant="caption" tone="textMuted">
          {tr('auth.otpHint')}
        </Text>
      </View>
    </Screen>
  );
}
