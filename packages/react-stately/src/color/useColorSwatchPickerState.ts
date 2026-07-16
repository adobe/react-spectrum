import {Color} from './types';
import {useColor} from './useColor';
import {useControlledState} from '../utils/useControlledState';
import {ValueBase} from '@react-types/shared';

export interface ColorSwatchPickerStateProps extends ValueBase<
  string | Color | null,
  Color | null
> {}

export interface ColorSwatchPickerState {
  /** The current color value of the color swatch picker. */
  color: Color | null;
  /** Sets the current color value of the color swatch picker. */
  setColor(color: Color | null): void;
}

export function useColorSwatchPickerState(
  props: ColorSwatchPickerStateProps
): ColorSwatchPickerState {
  let value = useColor(props.value);
  let defaultValue = useColor(props.defaultValue) ?? null;
  let [color, setColor] = useControlledState<Color | null>(value, defaultValue, props.onChange);

  return {
    color,
    setColor(color) {
      setColor(color);
    }
  };
}
