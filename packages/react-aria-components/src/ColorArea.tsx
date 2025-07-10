import {AriaColorAreaProps, useColorArea} from 'react-aria';
import {ColorAreaContext} from './RSPContexts';
import {ColorAreaState, useColorAreaState} from 'react-stately';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {GlobalDOMAttributes} from '@react-types/shared';
import {InternalColorThumbContext} from './ColorThumb';
import {Provider, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';

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

export interface ColorAreaProps extends AriaColorAreaProps, RenderProps<ColorAreaRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {}

export const ColorAreaStateContext = createContext<ColorAreaState | null>(null);

/**
 * A color area allows users to adjust two channels of an RGB, HSL or HSB color value against a two-dimensional gradient background.
 */
export const ColorArea = forwardRef(function ColorArea(props: ColorAreaProps, ref: ForwardedRef<HTMLDivElement>) {
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
    defaultStyle: colorAreaProps.style,
    values: {
      state,
      isDisabled: props.isDisabled || false
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;

  return (
    <div
      ref={ref}
      {...mergeProps(DOMProps, colorAreaProps, renderProps)}
      slot={props.slot || undefined}
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
});
