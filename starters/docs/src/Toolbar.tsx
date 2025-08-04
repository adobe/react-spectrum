'use client';
import {Toolbar as RACToolbar, ToolbarProps} from 'react-aria-components';
import './Toolbar.css';

export function Toolbar(props: ToolbarProps) {
  return <RACToolbar {...props} />;
}
