import {AriaLabelingProps, AriaValidationProps, Direction, FocusableDOMProps, FocusableProps, LabelableProps, LabelPosition, Orientation, RangeInputBase, RangeValue, StyleProps, Validation, ValueBase} from '@react-types/shared';
import {ReactNode} from 'react';

export interface BaseSliderProps extends RangeInputBase<number>, LabelableProps, AriaLabelingProps {
  isReadOnly?: boolean,
  isDisabled?: boolean,
  formatOptions?: Intl.NumberFormatOptions
}

export interface SliderProps extends BaseSliderProps, ValueBase<number[]> {
  onChangeEnd?: (value: number[]) => void,
  direction?: Direction
}

export interface SliderThumbProps extends AriaLabelingProps, FocusableDOMProps, FocusableProps, Validation, AriaValidationProps, LabelableProps {
  isReadOnly?: boolean,
  isDisabled?: boolean,
  index: number,
  direction?: Direction
}

export interface SpectrumBarSliderBase<T> extends Omit<BaseSliderProps, 'isReadOnly'>, ValueBase<T>, StyleProps {
  orientation?: Orientation,
  labelPosition?: LabelPosition,
  /** Whether the value's label is displayed. True by default if there's a `label`, false by default if not. */
  showValueLabel?: boolean,
  /** The content to display as the value's label. Overrides default formatted number. */
  valueLabel?: ReactNode
}

export interface SpectrumSliderTicksBase {
  /** Enables tick marks if > 0. Ticks will be evenly distributed between the min and max values. */
  tickCount?: number,

  /** Enables tick labels. */
  showTickLabels?: boolean,
  /**
   * By default, labels are formatted using the slider's number formatter,
   * but you can use the tickLabels prop to override these with custom labels.
   */
  tickLabels?: Array<ReactNode>
}

export interface SpectrumSliderProps extends SpectrumBarSliderBase<number>, SpectrumSliderTicksBase {
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
  trackGradient?: string[]
}

export interface SpectrumRangeSliderProps extends SpectrumBarSliderBase<RangeValue<number>>, SpectrumSliderTicksBase { }
