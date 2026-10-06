import { Image } from 'expo-image';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { tint, useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

/** Muestra la imagen real si existe; si no, un tile tintado con el emoji del producto. */
export function ProductImage({
  emoji,
  hue,
  image,
  height,
  width,
  radius,
  style,
}: {
  emoji: string;
  hue: string;
  image?: string;
  height: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const r = radius ?? t.radius.lg;
  return (
    <View
      style={[
        {
          height,
          width: width ?? '100%',
          borderRadius: r,
          backgroundColor: tint(hue, t.isDark),
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {image ? (
        <Image source={image} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
      ) : (
        <Text style={{ fontSize: height * 0.46, lineHeight: height * 0.6 }} accessible={false}>
          {emoji}
        </Text>
      )}
    </View>
  );
}
