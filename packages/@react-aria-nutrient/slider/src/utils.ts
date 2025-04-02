import {SliderState} from '@react-stately/slider';

interface SliderData {
  id: string,
  'aria-describedby'?: string,
  'aria-details'?: string
}

export const sliderData = new WeakMap<SliderState, SliderData>();

export function getSliderThumbId(state: SliderState, index: number): string {
  let data = sliderData.get(state);
  if (!data) {
    throw new Error('Unknown slider state');
  }

  return `${data.id}-${index}`;
}
