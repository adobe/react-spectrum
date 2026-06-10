'use client';
import {useToolbar, type AriaToolbarProps} from 'react-aria/useToolbar';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import './Toolbar.css';

export function Toolbar(props: AriaToolbarProps & {children?: ReactNode}) {
  let {orientation = 'horizontal'} = props;
  // useToolbar manages focus and arrow-key navigation between the children.
  let ref = useRef<HTMLDivElement>(null);
  let {toolbarProps} = useToolbar(props, ref);

  return (
    <div {...toolbarProps} ref={ref} className="react-aria-Toolbar" data-orientation={orientation}>
      {props.children}
    </div>
  );
}
