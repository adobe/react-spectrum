import {AriaColorSliderProps} from '@react-types/color';
import {ColorSliderContext} from './RSPContexts';
import {ColorSliderState, useColorSliderState} from '@react-stately/color';
import {filterDOMProps} from '@react-aria/utils';
import {InternalColorThumbContext} from './ColorThumb';
import {LabelContext} from './Label';
import {Orientation, useLocale} from 'react-aria';
import {Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {SliderOutputContext, SliderStateContext, SliderTrackContext} from './Slider';
import {useColorSlider} from '@react-aria/color';

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

export interface ColorSliderProps extends Omit<AriaColorSliderProps, 'label'>, RenderProps<ColorSliderRenderProps>, SlotProps {}

export const ColorSliderStateContext = createContext<ColorSliderState | null>(null);

function ColorSlider(props: ColorSliderProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ColorSliderContext);
  let {locale} = useLocale();
  let state = useColorSliderState({...props, locale});
  let trackRef = React.useRef(null);
  let inputRef = React.useRef(null);

  let [labelRef, label] = useSlot();
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

  let DOMProps = filterDOMProps(props);
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
}

/**
 * A color slider allows users to adjust an individual channel of a color value.
 */
const _ColorSlider = forwardRef(ColorSlider);
export {_ColorSlider as ColorSlider};
