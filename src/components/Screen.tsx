import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

/** Espacio que ocupan la tab bar + barra flotante de la cesta */
export const TAB_BAR_SPACE = 170;

export function Screen({
  children,
  edges = ['top'],
  style,
}: {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: t.colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}
