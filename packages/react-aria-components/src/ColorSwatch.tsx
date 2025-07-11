import {AriaColorSwatchProps, useColorSwatch} from 'react-aria';
import {Color} from 'react-stately';
import {ContextValue, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {GlobalDOMAttributes} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface ColorSwatchRenderProps {
  /** The color of the swatch. */
  color: Color
}

export interface ColorSwatchProps extends AriaColorSwatchProps, StyleRenderProps<ColorSwatchRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {}

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
