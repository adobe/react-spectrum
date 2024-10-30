import {AriaColorSwatchProps, useColorSwatch} from '@react-aria/color';
import {Color} from '@react-types/color';
import {ContextValue, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface ColorSwatchRenderProps {
  /** The color of the swatch. */
  color: Color
}

export interface ColorSwatchProps extends AriaColorSwatchProps, StyleRenderProps<ColorSwatchRenderProps>, SlotProps {}

export const ColorSwatchContext = createContext<ContextValue<ColorSwatchProps, HTMLDivElement>>(null);

function ColorSwatch(props: ColorSwatchProps, ref: ForwardedRef<HTMLDivElement>) {
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
  
  return (
    <div
      {...colorSwatchProps}
      {...renderProps}
      slot={props.slot || undefined}
      ref={ref} />
  );
}

/**
 * A ColorSwatch displays a preview of a selected color.
 */
const _ColorSwatch = forwardRef(ColorSwatch);
export {_ColorSwatch as ColorSwatch};
