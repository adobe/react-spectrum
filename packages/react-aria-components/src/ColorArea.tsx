import {AriaColorAreaProps} from '@react-types/color';
import {ColorAreaState, useColorAreaState} from '@react-stately/color';
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {InternalColorThumbContext} from './ColorThumb';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {useColorArea} from '@react-aria/color';

export interface ColorAreaRenderProps {
  /**
   * Whether the color area is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the color area.
   */
  state: ColorAreaState
}

export interface ColorAreaProps extends AriaColorAreaProps, RenderProps<ColorAreaRenderProps>, SlotProps {}

export const ColorAreaStateContext = createContext<ColorAreaState | null>(null);
export const ColorAreaContext = createContext<ContextValue<Partial<ColorAreaProps>, HTMLDivElement>>(null);

function ColorArea(props: ColorAreaProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ColorAreaContext);
  let inputXRef = useRef(null);
  let inputYRef = useRef(null);

  let state = useColorAreaState(props);
  let {
    colorAreaProps,
    xInputProps,
    yInputProps,
    thumbProps
  } = useColorArea({
    ...props,
    inputXRef,
    inputYRef,
    containerRef: ref
  }, state);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-ColorArea',
    values: {
      state,
      isDisabled: props.isDisabled || false
    }
  });

  return (
    <div
      ref={ref}
      {...colorAreaProps}
      {...renderProps}
      style={{
        ...colorAreaProps.style,
        ...renderProps.style
      }}
      data-disabled={props.isDisabled || undefined}>
      <Provider
        values={[
          [ColorAreaStateContext, state],
          [InternalColorThumbContext, {state, thumbProps, inputXRef, xInputProps, inputYRef, yInputProps, isDisabled: props.isDisabled}]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A color area allows users to adjust two channels of an RGB, HSL or HSB color value against a two-dimensional gradient background.
 */
const _ColorArea = forwardRef(ColorArea);
export {_ColorArea as ColorArea};
