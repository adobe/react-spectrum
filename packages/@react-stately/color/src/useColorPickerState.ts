import {Color} from '@react-types/color';
import {parseColor} from './Color';
import {useColor} from './useColor';
import {useControlledState} from '@react-stately/utils';
import {ValueBase} from '@react-types/shared';

export interface ColorPickerProps extends ValueBase<string | Color, Color> {}

export interface ColorPickerState {
  /** The current color value of the color picker. */
  color: Color,
  /** Sets the current color value of the color picker. */
  setColor(color: Color | null): void
}

export function useColorPickerState(props: ColorPickerProps): ColorPickerState {
  let value = useColor(props.value);
  let defaultValue = useColor(props.defaultValue || '#000000')!;
  let [color, setColor] = useControlledState(value || undefined, defaultValue, props.onChange);
  
  return {
    color,
    setColor(color) {
      if (color != null) {
        setColor(color || parseColor('#000000'));
      }
    }
  };
}
