import {AriaColorWheelOptions, useColorWheel} from '@react-aria/color';
import {ColorWheelState, useColorWheelState} from '@react-stately/color';
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {InternalColorThumbContext} from './ColorThumb';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';

export interface ColorWheelRenderProps {
  /**
   * Whether the color wheel is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the color slider.
   */
  state: ColorWheelState
}

export interface ColorWheelProps extends AriaColorWheelOptions, RenderProps<ColorWheelRenderProps>, SlotProps {}

export const ColorWheelContext = createContext<ContextValue<Partial<ColorWheelProps>, HTMLDivElement>>(null);
export const ColorWheelStateContext = createContext<ColorWheelState | null>(null);

function ColorWheel(props: ColorWheelProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ColorWheelContext);
  let state = useColorWheelState(props);
  let inputRef = useRef(null);
  let {trackProps, inputProps, thumbProps} = useColorWheel(props, state, inputRef);

  let renderProps = useRenderProps({
    ...props,
    values: {
      state,
      isDisabled: props.isDisabled || false
    },
    defaultClassName: 'react-aria-ColorWheel'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div 
      {...renderProps}
      ref={ref}
      style={{
        position: 'relative',
        ...renderProps.style
      }}
      data-disabled={props.isDisabled || undefined}>
      <div {...trackProps} />
      <Provider
        values={[
          [ColorWheelStateContext, state],
          [InternalColorThumbContext, {state, thumbProps, inputXRef: inputRef, xInputProps: inputProps, isDisabled: props.isDisabled}]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A color wheel allows users to adjust the hue of an HSL or HSB color value on a circular track.
 */
const _ColorWheel = forwardRef(ColorWheel);
export {_ColorWheel as ColorWheel};
