'use client';
import {
  ColorSwatch as AriaColorSwatch,
  ColorSwatchProps
} from 'react-aria-components';

import './ColorSwatch.css';

export function ColorSwatch(props: ColorSwatchProps) {
  return (
    (
      <AriaColorSwatch
        {...props}
        style={({ color }) => ({
          background: `linear-gradient(${color}, ${color}),
          repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
        })}
      />
    )
  );
}
