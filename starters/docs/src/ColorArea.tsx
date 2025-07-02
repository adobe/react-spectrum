'use client';
import {
  ColorArea as AriaColorArea,
  ColorAreaProps,
  ColorThumb
} from 'react-aria-components';

import './ColorArea.css';

export function ColorArea(props: ColorAreaProps) {
  return (
    (
      <AriaColorArea {...props}>
        <ColorThumb />
      </AriaColorArea>
    )
  );
}

export { ColorArea as MyColorArea };
