import {AriaLabelingProps, AriaValidationProps, FocusableDOMProps, FocusableProps, LabelableProps, RangeInputBase, Validation, ValueBase} from '@react-types/shared';

export interface BaseSliderProps extends RangeInputBase<number>, LabelableProps, AriaLabelingProps {
  isReadOnly?: boolean;
  isDisabled?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
}

export interface SliderProps extends BaseSliderProps, ValueBase<number[]> {
  onChangeEnd?: (value: number[]) => void;
}

/**
 * Subset of SliderThumbProps that should have the same value for all slider thumbs
 */
export interface CommonSliderThumbProps {
  labelId: string;
}


export interface SliderThumbProps extends CommonSliderThumbProps, AriaLabelingProps, FocusableDOMProps, FocusableProps, Validation, AriaValidationProps, LabelableProps {
  isReadOnly?: boolean;
  isDisabled?: boolean;
  index: number;
}
