import {AriaColorSwatchProps, useColorSwatch} from 'react-aria';
import {
  ClassNameOrFunction,
  ContextValue,
  SlotProps,
  StyleRenderProps,
  useContextProps,
  useRenderProps
} from './utils';
import {Color} from 'react-stately';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {GlobalDOMAttributes} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface ColorSwatchRenderProps {
  /** The color of the swatch. */
  color: Color
}

export interface ColorSwatchProps extends AriaColorSwatchProps, StyleRenderProps<ColorSwatchRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-ColorSwatch'
   */
  className?: ClassNameOrFunction<ColorSwatchRenderProps>
}

export const ColorSwatchContext = createContext<ContextValue<ColorSwatchProps, HTMLDivElement>>(null);

/**
 * A ColorSwatch displays a preview of a selected color.
 */
export const ColorSwatch = forwardRef(function ColorSwatch(props: ColorSwatchProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ColorSwatchContext);
  let {colorSwatchProps, color} = useColorSwatch(props);
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-ColorSwatch',
    defaultStyle: colorSwatchProps.style,
    values: {
      color
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});
  
  return (
    <div
      {...mergeProps(DOMProps, colorSwatchProps, renderProps)}
      slot={props.slot || undefined}
      ref={ref} />
  );
});
