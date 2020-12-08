import {AriaLabelingProps, AriaValidationProps, FocusableDOMProps, FocusableProps, LabelableProps, LabelPosition, Orientation, RangeInputBase, RangeValue, StyleProps, Validation, ValueBase} from '@react-types/shared';
import {ReactNode} from 'react';

export interface BaseSliderProps extends RangeInputBase<number>, LabelableProps, AriaLabelingProps {
  /**
   * The orientation of the Slider.
   * @default 'horizontal'
   */
  orientation?: Orientation,
  /** Whether the whole Slider is disabled. */
  isDisabled?: boolean,
  /**
   * The display format of the value label.
   */
  formatOptions?: Intl.NumberFormatOptions,
  /** Fired when the slider stops moving, due to being let go. */
  onChangeEnd?: (value: number[]) => void
}

export interface SliderProps extends BaseSliderProps, ValueBase<number[]> {}

export interface SliderThumbProps extends AriaLabelingProps, FocusableDOMProps, FocusableProps, Validation, AriaValidationProps, LabelableProps {
  /**
   * The orientation of the Slider.
   * @default 'horizontal'
   */
  orientation?: Orientation,
  /** Whether the Thumb is disabled. */
  isDisabled?: boolean,
  /** Index of the thumb for accessing purposes. */
  index: number
}

export interface SpectrumBarSliderBase<T> extends BaseSliderProps, ValueBase<T>, StyleProps {
  /**
   * The label's overall position relative to the element it is labeling.
   * @default 'top'
   */
  labelPosition?: LabelPosition,
  /** Whether the value's label is displayed. True by default if there's a `label`, false by default if not. */
  showValueLabel?: boolean,
  /** The content to display as the value's label. Overrides default formatted number. */
  valueLabel?: ReactNode,
  /**
   * The slider's minimum value.
   * @default '0'
   */
  minValue?: number,
  /**
   * The slider's maximum value.
   * @default '100'
   */
  maxValue?: number
}

export interface SpectrumSliderProps extends Omit<SpectrumBarSliderBase<number>, 'onChange' | 'onChangeEnd'> {
  /**
   * Whether a fill color is shown between the start of the slider and the current value.
   * @see https://spectrum.adobe.com/page/slider/#Fill.
   */
  isFilled?: boolean,
  /**
   * The offset from which to start the fill.
   * @see https://spectrum.adobe.com/page/slider/#Fill-start.
   */
  fillOffset?: number,
  /**
   * The background of the track, specified as the stops for a CSS background: `linear-gradient(to right/left, ...trackGradient)`.
   * @example trackGradient={['red', 'green']}
   * @example trackGradient={['red 20%', 'green 40%']}
   * @see https://spectrum.adobe.com/page/slider/#Gradient.
   */
  trackGradient?: string[],
  /**
   * Handler that is called when the value changes.
   */
  onChange?: (value: number) => void,
  /** Fired when the slider stops moving, due to being let go. */
  onChangeEnd?: (value: number) => void
}

export interface SpectrumRangeSliderProps extends SpectrumBarSliderBase<RangeValue<number>> { }
