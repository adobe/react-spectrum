'use client';
import {useColorSwatch, type AriaColorSwatchProps} from 'react-aria/useColorSwatch';
import './ColorSwatch.css';

export function ColorSwatch(props: AriaColorSwatchProps) {
  let {colorSwatchProps, color} = useColorSwatch(props);

  return (
    <div
      {...colorSwatchProps}
      className="react-aria-ColorSwatch"
      style={{
        ...colorSwatchProps.style,
        // The color (and the checkerboard for transparency) comes from the resolved color.
        background: `linear-gradient(${color}, ${color}),
          repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
      }}
    />
  );
}
