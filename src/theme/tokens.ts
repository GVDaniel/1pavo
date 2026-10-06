/**
 * ─────────────────────────────────────────────────────────────
 *  TOKENS DE MARCA 1PAVO
 *  Este es el ÚNICO archivo que hay que tocar para cambiar la marca.
 *  Capa 1: `palette` (colores base).
 *  Capa 2: `lightColors` / `darkColors` (tokens semánticos).
 *  Los componentes SOLO usan tokens semánticos.
 * ─────────────────────────────────────────────────────────────
 */

export const palette = {
  sun: '#FFD60A', // amarillo rótulo de tienda (color principal)
  sunDeep: '#E8B800',
  sunSoft: '#FFF4B8',
  neon: '#FF3D71', // rosa neón (ofertas, avisos de marca)
  neonSoft: '#FFE3EB',
  ink: '#141726', // tinta: texto y superficies oscuras en modo claro
  night: '#0D1024', // fondo del modo noche
  nightRaised: '#161A36',
  nightHigh: '#1E2346',
  nightLine: '#2A3060',
  mint: '#1FC77E',
  amber: '#F59E0B',
  red: '#EF4444',
  sky: '#3B82F6',
  white: '#FFFFFF',
  gray: {
    50: '#F4F6FB',
    100: '#EBEEF5',
    200: '#DDE1EC',
    300: '#C3C9D8',
    400: '#98A0B4',
    500: '#6B7389',
    600: '#4A5168',
    700: '#2F3550',
  },
} as const;

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  cta: string;
  ctaText: string;
  ctaStrong: string;
  ctaStrongText: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  highlight: string;
  priceTag: string;
  priceTagText: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
  skeleton: string;
  tabBar: string;
  mapCourier: string;
};

export const lightColors: ColorTokens = {
  background: palette.gray[50],
  surface: palette.white,
  surfaceAlt: palette.gray[100],
  surfaceElevated: palette.white,
  textPrimary: palette.ink,
  textSecondary: palette.gray[600],
  textMuted: palette.gray[400],
  textInverse: palette.white,
  border: palette.gray[200],
  borderStrong: palette.gray[300],
  cta: palette.sun,
  ctaText: palette.ink,
  ctaStrong: palette.ink,
  ctaStrongText: palette.white,
  accent: palette.neon,
  accentText: palette.white,
  accentSoft: palette.neonSoft,
  highlight: palette.sunSoft,
  priceTag: palette.sun,
  priceTagText: palette.ink,
  success: palette.mint,
  warning: palette.amber,
  error: palette.red,
  info: palette.sky,
  overlay: 'rgba(13,16,36,0.45)',
  skeleton: palette.gray[100],
  tabBar: 'rgba(255,255,255,0.82)',
  mapCourier: palette.neon,
};

export const darkColors: ColorTokens = {
  background: palette.night,
  surface: palette.nightRaised,
  surfaceAlt: palette.nightHigh,
  surfaceElevated: palette.nightHigh,
  textPrimary: '#F3F4FA',
  textSecondary: '#A9AFC8',
  textMuted: '#6D7497',
  textInverse: palette.ink,
  border: palette.nightLine,
  borderStrong: '#39407A',
  cta: palette.sun,
  ctaText: palette.ink,
  ctaStrong: palette.sun,
  ctaStrongText: palette.ink,
  accent: palette.neon,
  accentText: palette.white,
  accentSoft: 'rgba(255,61,113,0.16)',
  highlight: 'rgba(255,214,10,0.12)',
  priceTag: palette.sun,
  priceTagText: palette.ink,
  success: palette.mint,
  warning: palette.amber,
  error: '#FF6B6B',
  info: '#60A5FA',
  overlay: 'rgba(0,0,0,0.6)',
  skeleton: palette.nightHigh,
  tabBar: 'rgba(13,16,36,0.78)',
  mapCourier: palette.neon,
};

/** Tipografías: cámbialas aquí (y en src/app/_layout.tsx si cambias de familia). */
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemibold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
} as const;

export const typeScale = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, letterSpacing: -1.2 },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 33, letterSpacing: -0.8 },
  h2: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 27, letterSpacing: -0.4 },
  h3: { fontFamily: fonts.displayBold, fontSize: 18, lineHeight: 23, letterSpacing: -0.2 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  smallStrong: { fontFamily: fonts.bodySemibold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 20 },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

/** Horario del modo noche automático (hora local). */
export const nightMode = { startHour: 21, endHour: 7 } as const;
