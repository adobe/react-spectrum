import {ActionButton} from '@react-spectrum/button';
import {filterDOMProps} from '@react-aria/utils';
import {FocusableRef} from '@react-types/shared';
import {Menu} from './Menu';
import {MenuTrigger} from './MenuTrigger';
import More from '@spectrum-icons/workflow/More';
import React from 'react';
import {SpectrumActionMenuProps} from '@react-types/menu';

function ActionMenu<T extends object>(props: SpectrumActionMenuProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  let buttonProps = filterDOMProps(props);
  if (buttonProps['aria-label'] === undefined) {
    buttonProps['aria-label'] = 'More actions';
  }
  
  return (
    <MenuTrigger 
      align={props.align}
      direction={props.direction}
      shouldFlip={props.shouldFlip}>
      <ActionButton 
        ref={ref} 
        {...buttonProps}
        isDisabled={props.isDisabled}
        isQuiet={props.isQuiet}
        autoFocus={props.autoFocus}>
        <More />
      </ActionButton>
      <Menu 
        children={props.children} 
        items={props.items} 
        disabledKeys={props.disabledKeys}
        onAction={props.onAction} />
    </MenuTrigger>
  );
}

let _ActionMenu = React.forwardRef(ActionMenu);
export {_ActionMenu as ActionMenu};
