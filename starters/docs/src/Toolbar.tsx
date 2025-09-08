'use client';
import {Toolbar as RACToolbar, ToggleButtonGroupContext, ToolbarProps} from 'react-aria-components';
import './Toolbar.css';

export function Toolbar(props: ToolbarProps) {
  return (
    <ToggleButtonGroupContext value={{orientation: props.orientation}}>
      <RACToolbar {...props} />
    </ToggleButtonGroupContext>
  );
}
