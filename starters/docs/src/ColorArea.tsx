'use client';
import {
  ColorArea as AriaColorArea,
  ColorAreaProps
} from 'react-aria-components';

import {ColorThumb} from './ColorThumb';
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
