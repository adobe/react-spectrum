import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};
import {ReactElement, cloneElement} from 'react';
import {CenterBaseline} from './CenterBaseline.tsx';
import {mergeStyles} from '../style-macro/runtime.ts';

interface IconProps {
  className?: string,
  children: ReactElement
}

export function Icon(props: IconProps) {
  return (
    <CenterBaseline slot="icon" className={mergeStyles(style({marginStart: '--iconMargin', flexShrink: 0})(), props.className)}>
      {cloneElement(props.children, {
        className: style({
          fill: 'currentColor',
          size: '[calc(20 / 14 * 1em)]'
        })()
      })}
    </CenterBaseline>
  );
}
