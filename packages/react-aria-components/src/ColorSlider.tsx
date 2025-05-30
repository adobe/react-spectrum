import {AriaColorSliderProps, Orientation, useColorSlider, useLocale} from 'react-aria';
import {ColorSliderContext} from './RSPContexts';
import {ColorSliderState, useColorSliderState} from 'react-stately';
import {filterDOMProps} from '@react-aria/utils';
import {GlobalDOMAttributes} from '@react-types/shared';
import {InternalColorThumbContext} from './ColorThumb';
import {LabelContext} from './Label';
import {Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {SliderOutputContext, SliderStateContext, SliderTrackContext} from './Slider';

export interface ColorSliderRenderProps {
  /**
   * The orientation of the color slider.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation,
  /**
   * Whether the color slider is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the color slider.
   */
  state: ColorSliderState
}

export interface ColorSliderProps extends Omit<AriaColorSliderProps, 'label'>, RenderProps<ColorSliderRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {}

export const ColorSliderStateContext = createContext<ColorSliderState | null>(null);

/**
 * A color slider allows users to adjust an individual channel of a color value.
 */
export const ColorSlider = forwardRef(function ColorSlider(props: ColorSliderProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ColorSliderContext);
  let {locale} = useLocale();
  let state = useColorSliderState({...props, locale});
  let trackRef = React.useRef(null);
  let inputRef = React.useRef(null);

  let [labelRef, label] = useSlot(
    !props['aria-label'] && !props['aria-labelledby']
  );
  let {
    trackProps,
    thumbProps,
    inputProps,
    labelProps,
    outputProps
  } = useColorSlider({
    ...props,
    label,
    trackRef,
    inputRef
  }, state);

  let renderProps = useRenderProps({
    ...props,
    values: {
      orientation: state.orientation,
      isDisabled: state.isDisabled,
      state
    },
    defaultClassName: 'react-aria-ColorSlider'
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [ColorSliderStateContext, state],
        [SliderStateContext, state],
        [SliderTrackContext, {...trackProps, ref: trackRef}],
        [SliderOutputContext, outputProps],
        [LabelContext, {
          ...labelProps,
          ref: labelRef,
          children: state.value.getChannelName(props.channel, locale)
        }],
        [InternalColorThumbContext, {state, thumbProps, inputXRef: inputRef, xInputProps: inputProps, isDisabled: props.isDisabled}]
      ]}>
      <div
        {...DOMProps}
        {...renderProps}
        ref={ref}
        slot={props.slot || undefined}
        data-orientation={state.orientation}
        data-disabled={state.isDisabled || undefined} />
    </Provider>
  );
});
