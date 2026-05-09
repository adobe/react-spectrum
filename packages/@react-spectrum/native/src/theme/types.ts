export interface NativeTheme {
  colorScheme: 'light' | 'dark';
  colors: Record<string, string>;
  spacing: Record<string, number>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, number>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, number>;
  };
  radius: Record<string, number>;
  border: {
    width: Record<string, number>;
    color: Record<string, string>;
  };
  shadow: Record<
    string,
    {elevation: number; shadowColor: string; shadowOpacity: number; shadowRadius: number}
  >;
  opacity: Record<string, number>;
  motion: Record<string, number>;
}

export type SpectrumTokenPath =
  | `colors.${string}`
  | `spacing.${string}`
  | `typography.fontFamily.${string}`
  | `typography.fontSize.${string}`
  | `typography.fontWeight.${string}`
  | `typography.lineHeight.${string}`
  | `radius.${string}`
  | `border.width.${string}`
  | `border.color.${string}`
  | `opacity.${string}`
  | `motion.${string}`;
