import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Header, Icon, Screen, Text } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTime } from '@/utils/format';

type Msg = { id: string; from: 'me' | 'agent'; text: string; at: string };

/** Chat de soporte simulado. Sustituir por tu proveedor (Intercom, Zendesk, WebSocket propio…) */
export default function Chat() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<Msg>>(null);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 'm0', from: 'agent', text: tr('chat.greeting'), at: new Date().toISOString() }]);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    setMsgs((m) => [...m, { id: `m${Date.now()}`, from: 'me', text: value, at: new Date().toISOString() }]);
    setText('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: `a${Date.now()}`, from: 'agent', text: tr('chat.reply'), at: new Date().toISOString() }]);
    }, 1400);
  };

  return (
    <Screen>
      <Header title={tr('chat.title')} subtitle={typing ? tr('chat.typing') : tr('chat.online')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top + 60}>
        <FlatList
          ref={list}
          data={msgs}
          keyExtractor={(m) => m.id}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.sm }}
          renderItem={({ item }) => {
            const me = item.from === 'me';
            return (
              <View style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '80%', backgroundColor: me ? t.colors.ctaStrong : t.colors.surface, borderRadius: t.radius.lg, borderBottomRightRadius: me ? 4 : t.radius.lg, borderBottomLeftRadius: me ? t.radius.lg : 4, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm }}>
                <Text color={me ? t.colors.ctaStrongText : undefined}>{item.text}</Text>
                <Text variant="caption" color={me ? t.colors.ctaStrongText : undefined} tone="textMuted" style={{ opacity: 0.7, alignSelf: 'flex-end', marginTop: 2 }}>
                  {formatTime(item.at)}
                </Text>
              </View>
            );
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: t.spacing.sm, padding: t.spacing.md, paddingBottom: Math.max(insets.bottom, t.spacing.md), borderTopWidth: 1, borderTopColor: t.colors.border, backgroundColor: t.colors.surface }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={tr('chat.placeholder')}
            placeholderTextColor={t.colors.textMuted}
            multiline
            style={[t.type.body, { flex: 1, maxHeight: 110, color: t.colors.textPrimary, backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.lg, paddingHorizontal: t.spacing.md, paddingVertical: 10 }]}
            accessibilityLabel={tr('chat.placeholder')}
          />
          <Pressable onPress={send} disabled={!text.trim()} accessibilityRole="button" accessibilityLabel={tr('chat.send')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.colors.cta, alignItems: 'center', justifyContent: 'center', opacity: text.trim() ? 1 : 0.5 }}>
            <Icon name="arrow-up" size={22} color={t.colors.ctaText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
