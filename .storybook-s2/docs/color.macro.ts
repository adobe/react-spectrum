import {colorScale} from '../../packages/@react-spectrum/s2/style/tokens';
import {style} from '../../packages/@react-spectrum/s2/style';

export function getColorScale(name: string) {
  return Object.keys(colorScale(name)).map((k) => [k, colorSwatch.call(this, k)]);
}

export function colorSwatch(color: string, type = 'backgroundColor') {
  return style.call(this, {'--v': {type, value: color}, backgroundColor: '--v', size: 20, borderRadius: 'sm', borderWidth: 1, borderColor: 'gray-1000/15', borderStyle: 'solid'});
}
