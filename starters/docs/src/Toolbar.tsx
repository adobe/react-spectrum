'use client';
import {Toolbar as RACToolbar, SeparatorContext, ToggleButtonGroupContext, ToolbarProps} from 'react-aria-components';
import './Toolbar.css';

export function Toolbar(props: ToolbarProps) {
  let {orientation = 'horizontal'} = props;
  return (
    <ToggleButtonGroupContext.Provider value={{orientation}}>
      <SeparatorContext.Provider value={{orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal'}}>
        <RACToolbar {...props} />
      </SeparatorContext.Provider>
    </ToggleButtonGroupContext.Provider>
  );
}
