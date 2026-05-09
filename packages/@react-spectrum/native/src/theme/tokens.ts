import type {NativeTheme} from './types';

export const spectrumTokens: {
  borderWidth: Record<string, number>;
  motion: Record<string, number>;
  opacity: Record<string, number>;
  radius: Record<string, number>;
  spacing: Record<string, number>;
  typography: NativeTheme['typography'];
} = {
  spacing: {
    0: 0,
    25: 1,
    50: 2,
    75: 3,
    100: 4,
    150: 6,
    200: 8,
    250: 10,
    300: 12,
    350: 14,
    400: 16,
    450: 18,
    500: 20,
    600: 24,
    700: 28,
    800: 32,
    900: 36,
    1000: 40,
    1200: 48,
    1600: 64
  },
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    full: 999
  },
  typography: {
    fontFamily: {
      body: 'System',
      heading: 'System',
      code: 'Courier'
    },
    fontSize: {
      75: 11,
      100: 12,
      200: 14,
      300: 16,
      400: 18,
      500: 20,
      700: 28,
      900: 36
    },
    lineHeight: {
      100: 16,
      200: 20,
      300: 24,
      400: 26,
      500: 28,
      700: 36,
      900: 44
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  borderWidth: {
    none: 0,
    thin: 1,
    thick: 2
  },
  opacity: {
    disabled: 0.42,
    pressed: 0.72,
    overlay: 0.48
  },
  motion: {
    fast: 120,
    normal: 200,
    slow: 350
  }
};

export const lightTheme: NativeTheme = {
  colorScheme: 'light',
  colors: {
    background: '#ffffff',
    surface: '#f8f8f8',
    surfaceElevated: '#ffffff',
    text: '#222222',
    textMuted: '#6e6e6e',
    border: '#d5d5d5',
    accent: '#0f62fe',
    accentText: '#ffffff',
    negative: '#d31510',
    positive: '#12805c',
    notice: '#b7791f',
    informative: '#1473e6',
    focusRing: '#2680eb'
  },
  spacing: spectrumTokens.spacing,
  typography: spectrumTokens.typography,
  radius: spectrumTokens.radius,
  border: {
    width: spectrumTokens.borderWidth,
    color: {
      default: '#d5d5d5',
      focus: '#2680eb',
      negative: '#d31510'
    }
  },
  shadow: {
    sm: {elevation: 1, shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 2},
    md: {elevation: 3, shadowColor: '#000000', shadowOpacity: 0.16, shadowRadius: 6}
  },
  opacity: spectrumTokens.opacity,
  motion: spectrumTokens.motion
};

export const darkTheme: NativeTheme = {
  ...lightTheme,
  colorScheme: 'dark',
  colors: {
    background: '#1e1e1e',
    surface: '#2c2c2c',
    surfaceElevated: '#323232',
    text: '#f5f5f5',
    textMuted: '#b8b8b8',
    border: '#505050',
    accent: '#4b9cf5',
    accentText: '#000000',
    negative: '#ff5f58',
    positive: '#33ab84',
    notice: '#d89c28',
    informative: '#4b9cf5',
    focusRing: '#4b9cf5'
  },
  border: {
    width: spectrumTokens.borderWidth,
    color: {
      default: '#505050',
      focus: '#4b9cf5',
      negative: '#ff5f58'
    }
  }
};

export const defaultTheme = lightTheme;
