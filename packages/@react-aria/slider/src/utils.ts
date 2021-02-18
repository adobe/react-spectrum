import {SliderState} from '@react-stately/slider';

export const sliderIds = new WeakMap<SliderState, string>();

export function getSliderThumbId(state: SliderState, index: number) {
  let id = sliderIds.get(state);
  if (!id) {
    throw new Error('Unknown slider state');
  }

  return `${id}-${index}`;
}
