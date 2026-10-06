import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import {
  ColorTokens,
  darkColors,
  fonts,
  lightColors,
  nightMode,
  radius,
  spacing,
  typeScale,
} from './tokens';
import { usePrefsStore } from '@/store/prefsStore';

export type Theme = {
  isDark: boolean;
  colors: ColorTokens;
  fonts: typeof fonts;
  type: typeof typeScale;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: { sm: ViewStyle; md: ViewStyle; lg: ViewStyle };
};

export type ColorKey = keyof ColorTokens;

export function isNightHour(hour: number) {
  return hour >= nightMode.startHour || hour < nightMode.endHour;
}

function buildTheme(isDark: boolean): Theme {
  const shadowColor = isDark ? '#000' : '#1A1F3D';
  const mk = (y: number, blur: number, opacity: number, elevation: number): ViewStyle => ({
    shadowColor,
    shadowOffset: { width: 0, height: y },
    shadowRadius: blur,
    shadowOpacity: isDark ? opacity * 1.6 : opacity,
    elevation,
  });
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    fonts,
    type: typeScale,
    spacing,
    radius,
    shadow: { sm: mk(2, 6, 0.06, 2), md: mk(8, 18, 0.08, 6), lg: mk(16, 32, 0.14, 12) },
  };
}

const ThemeContext = createContext<Theme>(buildTheme(false));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = usePrefsStore((s) => s.themeMode);
  const system = useColorScheme();
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const id = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && system === 'dark') ||
    (mode === 'auto-night' && isNightHour(hour));

  const theme = useMemo(() => buildTheme(isDark), [isDark]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Crea un hook de estilos que se recalcula al cambiar de tema. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (t: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}

/** Tinta un color de categoría según el tema (hex de 6 dígitos). */
export function tint(hex: string, isDark: boolean) {
  return `${hex}${isDark ? '33' : '24'}`;
}
