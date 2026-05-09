import type {MeterVariant, ProgressState, ProgressStaticColor} from './types';
import type {NativeTheme} from '../../theme';
import type {ReactNode} from 'react';

export function getProgressState({
  isIndeterminate,
  locale,
  maxValue = 100,
  minValue = 0,
  value = 0,
  valueLabel
}: {
  isIndeterminate?: boolean;
  locale?: string;
  maxValue?: number;
  minValue?: number;
  value?: number;
  valueLabel?: string;
}): ProgressState {
  let safeMin = Number.isFinite(minValue) ? minValue : 0;
  let safeMax = Number.isFinite(maxValue) ? maxValue : 100;

  if (safeMax <= safeMin) {
    safeMax = safeMin + 1;
  }

  let clampedValue = clamp(Number.isFinite(value) ? value : safeMin, safeMin, safeMax);
  let percentage = ((clampedValue - safeMin) / (safeMax - safeMin)) * 100;
  let valueText =
    valueLabel ?? (isIndeterminate ? undefined : formatPercentage(percentage, locale));

  return {
    accessibilityValue: isIndeterminate
      ? {text: valueText}
      : {
          min: safeMin,
          max: safeMax,
          now: clampedValue,
          text: valueText
        },
    maxValue: safeMax,
    minValue: safeMin,
    percentage,
    value: clampedValue,
    valueText
  };
}

export function getLabelText(label: ReactNode): string | undefined {
  return typeof label === 'string' || typeof label === 'number' ? String(label) : undefined;
}

export function getProgressColor(
  theme: NativeTheme,
  staticColor: ProgressStaticColor | undefined,
  fallback: keyof NativeTheme['colors'] = 'accent'
) {
  switch (staticColor) {
    case 'black':
      return '#000000';
    case 'white':
      return '#ffffff';
    default:
      return theme.colors[fallback];
  }
}

export function getTrackColor(theme: NativeTheme, staticColor?: ProgressStaticColor) {
  switch (staticColor) {
    case 'black':
      return 'rgba(0, 0, 0, 0.25)';
    case 'white':
      return 'rgba(255, 255, 255, 0.35)';
    default:
      return theme.colors.border;
  }
}

export function getMeterColor(theme: NativeTheme, variant: MeterVariant = 'informative') {
  switch (variant) {
    case 'negative':
      return theme.colors.negative;
    case 'notice':
      return theme.colors.notice;
    case 'positive':
      return theme.colors.positive;
    default:
      return theme.colors.informative;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPercentage(value: number, locale?: string) {
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      style: 'percent'
    }).format(value / 100);
  } catch {
    return `${Math.round(value)}%`;
  }
}
