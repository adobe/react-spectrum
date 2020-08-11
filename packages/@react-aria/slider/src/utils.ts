import {BaseSliderProps} from '@react-types/slider';
import {SliderState} from '@react-stately/slider';

export const sliderIds = new WeakMap<SliderState, string>();

export function computeOffsetToValue(offset: number, props: BaseSliderProps, trackRef: React.RefObject<HTMLElement>) {
  const {minValue = 0, maxValue = 100, step = 1} = props;
  if (!trackRef.current) {
    return minValue;
  }

  const containerSize = trackRef.current.offsetWidth;
  const val = offset / containerSize * (maxValue - minValue) + minValue;
  return Math.round((val - minValue) / step) * step + minValue;
}
