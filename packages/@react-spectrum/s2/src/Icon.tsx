import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};
import {ReactElement, cloneElement} from 'react';
import {CenterBaseline} from './CenterBaseline.tsx';

interface IconProps {
  children: ReactElement
}

export function Icon(props: IconProps) {
  return (
    <CenterBaseline slot="icon" className={style({marginStart: '--iconMargin', flexShrink: 0})()}>
      {cloneElement(props.children, {
        className: style({
          fill: 'currentColor',
          width: '[calc(20 / 14 * 1em)]',
          height: '[calc(20 / 14 * 1em)]'
        })()
      })}
    </CenterBaseline>
  );
}
