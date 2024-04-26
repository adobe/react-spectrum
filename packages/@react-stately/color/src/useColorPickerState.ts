import {Color} from '@react-types/color';
import {useColor} from './useColor';
import {useControlledState} from '@react-stately/utils';
import {ValueBase} from '@react-types/shared';

export interface ColorPickerProps extends ValueBase<string | Color, Color> {}

export interface ColorPickerState {
  /** The current color value of the color picker. */
  color: Color,
  /** Sets the current color value of the color picker. */
  setColor(color: Color): void
}

export function useColorPickerState(props: ColorPickerProps) {
  let value = useColor(props.value);
  let defaultValue = useColor(props.defaultValue || '#0000');
  let [color, setColor] = useControlledState(value, defaultValue, props.onChange);
  
  return {
    color,
    setColor
  };
}
