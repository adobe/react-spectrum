import React from 'react';
import {ColorSwatch as AriaColorSwatch, ColorSwatchProps} from 'react-aria-components';
import { composeTailwindRenderProps } from './utils';

export function ColorSwatch(props: ColorSwatchProps) {
  return (
    <AriaColorSwatch 
      {...props}
      className={composeTailwindRenderProps(props.className, 'w-8 h-8 rounded-xs border border-black/10')}
      style={({color}) => ({
        background: `linear-gradient(${color}, ${color}),
          repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
      })} />
  );
}
