import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

// Global palette for eMaamul (Modern / Premium)
export const Colors = {
  primary: '#FE4D2D',             // Brand accent (warm neon orange)
  secondary: '#0A1F4B',           // Deep brand blue (support)
  background: '#050B16',          // Base background
  backgroundAlt: '#071123',       // Slightly brighter background for sections
  surface: 'rgba(14, 24, 38, 0.88)',
  surfaceAlt: 'rgba(10, 18, 32, 0.72)',
  surfaceActive: 'rgba(24, 36, 54, 0.92)',
  text: '#F3F4F6',
  onSurfaceText: '#E7ECF5',
  mutedDark: '#8FA0C2',
  mutedSurface: '#6F809E',
  muted: '#6F809E',
  outline: 'rgba(32, 58, 94, 0.6)',
  glow: 'rgba(1, 204, 255, 0.4)',
  success: '#20E070',
  danger: '#FF5C70',
  gradientPrimary: ['#08253E', '#050B16'],
  gradientHighlight: ['rgba(1,204,255,0.12)', 'transparent'],
  gradientCardBorder: ['rgba(1,204,255,0.55)', 'rgba(254,77,45,0.35)'],
  gradientButton: ['#FE4D2D', '#FF7A3D'],
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    background: Colors.background,
    surface: Colors.surface,
    onBackground: Colors.text,
    onSurface: Colors.onSurfaceText,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    outline: Colors.outline,
    surfaceVariant: Colors.surfaceAlt,
    inverseOnSurface: Colors.text,
    elevation: {
      ...DefaultTheme.colors.elevation,
      level2: Colors.surfaceAlt,
      level3: Colors.surfaceActive,
    },
  },
  roundness: 16,
  fonts: {
    ...DefaultTheme.fonts,
    bodyLarge: { ...DefaultTheme.fonts.bodyLarge, fontFamily: 'Poppins_400Regular' },
    bodyMedium: { ...DefaultTheme.fonts.bodyMedium, fontFamily: 'Poppins_400Regular' },
    bodySmall: { ...DefaultTheme.fonts.bodySmall, fontFamily: 'Poppins_400Regular' },
    labelLarge: { ...DefaultTheme.fonts.labelLarge, fontFamily: 'Poppins_500Medium' },
    titleMedium: { ...DefaultTheme.fonts.titleMedium, fontFamily: 'Poppins_600SemiBold' },
    titleLarge: { ...DefaultTheme.fonts.titleLarge, fontFamily: 'Poppins_600SemiBold' },
    headlineSmall: { ...DefaultTheme.fonts.headlineSmall, fontFamily: 'Poppins_700Bold' },
  },
  custom: {
    glowShadow: {
      shadowColor: Colors.glow,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.35,
      shadowRadius: 40,
    },
  },
};

export const spacing = (n = 1) => 8 * n;
