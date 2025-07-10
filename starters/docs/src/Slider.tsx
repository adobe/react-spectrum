'use client';
import {
  Slider as AriaSlider,
  SliderOutput,
  SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack
} from 'react-aria-components';
import {Label} from './Form';
import './Slider.css';

export interface SliderProps<T> extends AriaSliderProps<T> {
  label?: string;
  thumbLabels?: string[];
}

export function Slider<T extends number | number[]>(
  { label, thumbLabels, ...props }: SliderProps<T>
) {
  return (
    (
      <AriaSlider {...props}>
        {label && <Label>{label}</Label>}
        <SliderOutput>
          {({ state }) =>
            state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
        </SliderOutput>
        <SliderTrack>
          {({ state }) =>
            state.values.map((_, i) => (
              <SliderThumb key={i} index={i} aria-label={thumbLabels?.[i]} />
            ))}
        </SliderTrack>
      </AriaSlider>
    )
  );
}
