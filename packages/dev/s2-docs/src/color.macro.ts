import {colorScale} from '../../../@react-spectrum/s2/style/tokens';
import type {MacroContext} from '@parcel/macros';
import {style} from '@react-spectrum/s2/style';

export function getColorScale(this: MacroContext | void, name: string) {
  return Object.keys(colorScale(name)).map((k) => [k, colorSwatch.call(this, k)]);
}

export function colorSwatch(this: MacroContext | void, color: string, type = 'backgroundColor') {
  // @ts-ignore
  return style.call(this, {'--v': {type, value: color}, backgroundColor: '--v', size: 20, borderRadius: 'sm', borderWidth: 1, borderColor: 'gray-1000/15', borderStyle: 'solid'});
}
