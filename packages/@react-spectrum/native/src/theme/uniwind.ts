import type {NativeTheme} from './types';

export function createUniwindTheme(theme: NativeTheme) {
  return {
    borderColor: theme.border.color,
    borderWidth: Object.fromEntries(
      Object.entries(theme.border.width).map(([key, value]) => [key, `${value}px`])
    ),
    colors: theme.colors,
    opacity: theme.opacity,
    spacing: Object.fromEntries(
      Object.entries(theme.spacing).map(([key, value]) => [key, `${value}px`])
    ),
    borderRadius: Object.fromEntries(
      Object.entries(theme.radius).map(([key, value]) => [key, `${value}px`])
    ),
    fontFamily: theme.typography.fontFamily,
    fontSize: Object.fromEntries(
      Object.entries(theme.typography.fontSize).map(([key, value]) => [key, `${value}px`])
    )
  };
}
