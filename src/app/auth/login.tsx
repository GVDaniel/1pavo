import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, repos } from '@/api';
import { Button, Header, Input, Logo, Screen, Text } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AuthSession } from '@/types';

export default function Login() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const digits = phone.replace(/\D/g, '').replace(/^34/, '');
  const phoneValid = /^[6789]\d{8}$/.test(digits);
  const emailValid = /^\S+@\S+\.\S+$/.test(email);

  const done = (s: AuthSession) => {
    setSession(s);
    toast(tr('auth.welcome', { name: s.user.firstName }), 'success');
    if (router.canGoBack()) router.back();
    if (redirect) router.push(redirect);
  };

  async function run(key: string, fn: () => Promise<AuthSession>) {
    setLoading(key);
    setError(undefined);
    try {
      done(await fn());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : tr('errors.generic'));
    } finally {
      setLoading(null);
    }
  }

  async function sendOtp() {
    setLoading('otp');
    try {
      await repos.auth.requestOtp(`+34${digits}`);
      router.push({ pathname: '/auth/otp', params: { phone: `+34${digits}`, redirect } });
    } catch {
      toast(tr('errors.generic'), 'error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Header close />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.xxxl, gap: t.spacing.xl }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: t.spacing.md }}>
          <Logo size={28} />
          <Text variant="display" style={{ marginTop: t.spacing.lg }}>
            {tr('auth.title')}
          </Text>
          <Text tone="textSecondary">{tr('auth.subtitle')}</Text>
        </View>

        {mode === 'phone' ? (
          <View style={{ gap: t.spacing.md }}>
            <Input
              label={tr('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              placeholder="612 345 678"
              maxLength={11}
              left={
                <View style={{ paddingRight: t.spacing.sm, borderRightWidth: 1, borderRightColor: t.colors.border }}>
                  <Text variant="bodyStrong">🇪🇸 +34</Text>
                </View>
              }
            />
            <Button title={tr('auth.sendCode')} variant="dark" size="lg" disabled={!phoneValid} loading={loading === 'otp'} onPress={sendOtp} />
          </View>
        ) : (
          <View style={{ gap: t.spacing.md }}>
            <Input label={tr('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" icon="mail-outline" />
            <Input label={tr('auth.password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" icon="lock-closed-outline" error={error} />
            <Button
              title={tr('auth.enter')}
              variant="dark"
              size="lg"
              disabled={!emailValid || !password}
              loading={loading === 'email'}
              onPress={() => run('email', () => repos.auth.loginWithEmail(email, password))}
            />
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
          <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
          <Text variant="caption" tone="textMuted">
            {tr('auth.or')}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
        </View>

        <View style={{ gap: t.spacing.md }}>
          {Platform.OS !== 'android' && (
            <Button title={tr('auth.apple')} icon="logo-apple" variant="ghost" size="lg" loading={loading === 'apple'} onPress={() => run('apple', () => repos.auth.loginWithProvider('apple'))} />
          )}
          <Button title={tr('auth.google')} icon="logo-google" variant="ghost" size="lg" loading={loading === 'google'} onPress={() => run('google', () => repos.auth.loginWithProvider('google'))} />
          <Button
            title={mode === 'phone' ? tr('auth.useEmail') : tr('auth.usePhone')}
            icon={mode === 'phone' ? 'mail-outline' : 'phone-portrait-outline'}
            variant="ghost"
            size="lg"
            onPress={() => setMode(mode === 'phone' ? 'email' : 'phone')}
          />
        </View>

        <Pressable onPress={() => router.back()} style={{ alignSelf: 'center' }} accessibilityRole="button" hitSlop={10}>
          <Text variant="smallStrong" tone="textSecondary" style={{ textDecorationLine: 'underline' }}>
            {tr('auth.guest')}
          </Text>
        </Pressable>
        <Text variant="caption" tone="textMuted" align="center">
          {tr('auth.legal')}
        </Text>
      </ScrollView>
    </Screen>
  );
}
