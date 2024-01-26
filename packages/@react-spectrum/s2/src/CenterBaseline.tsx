import {ReactNode} from 'react';
import {raw} from '../style-macro/style-macro.ts' with {type: 'macro'};

interface CenterBaselineProps {
  className?: string,
  children: ReactNode,
  slot?: string
}

export function CenterBaseline(props: CenterBaselineProps) {
  return (
    <div slot={props.slot} className={(props.className || '') + ' ' + raw('display: flex; align-items: center; &::before { content: "\u00a0"; width: 0; visibility: hidden }')}>
      {props.children}
    </div>
  );
}

export const centerBaselineBefore = raw('&::before { content: "\u00a0"; width: 0; visibility: hidden }');
