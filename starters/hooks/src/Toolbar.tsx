'use client';
import {useToolbar, type AriaToolbarProps} from 'react-aria/useToolbar';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import './Toolbar.css';

export interface ToolbarProps extends AriaToolbarProps {
  children?: ReactNode;
}

export function Toolbar(props: ToolbarProps) {
  let {orientation = 'horizontal'} = props;
  let ref = useRef<HTMLDivElement>(null);
  /*- begin highlight -*/
  let {toolbarProps} = useToolbar(props, ref);
  /*- end highlight -*/

  return (
    <div {...toolbarProps} ref={ref} className="react-aria-Toolbar" data-orientation={orientation}>
      {props.children}
    </div>
  );
}
