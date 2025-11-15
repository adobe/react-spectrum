import {colorScale} from '../../../@react-spectrum/s2/style/tokens';
import type {MacroContext} from '@parcel/macros';
import {style} from '@react-spectrum/s2/style';

export function getColorScale(this: MacroContext | void, name: string, size = 20) {
  return Object.keys(colorScale(name)).map((k) => [k, colorSwatch.call(this, k, 'backgroundColor', size)]);
}

export function colorSwatch(this: MacroContext | void, color: string, type = 'backgroundColor', size = 20) {
  // @ts-ignore
  return style.call(this, {'--v': {type, value: color}, backgroundColor: '--v', size, borderRadius: 'sm', borderWidth: 1, borderColor: 'gray-1000/15', borderStyle: 'solid'});
}
