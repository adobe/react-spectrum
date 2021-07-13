import {ActionButton} from '@react-spectrum/button';
import {FocusableRef} from '@react-types/shared';
import {Menu} from './Menu';
import {MenuTrigger} from './MenuTrigger';
import More from '@spectrum-icons/workflow/More';
import React from 'react';
import {SpectrumActionMenuProps} from '@react-types/menu';
import {useLabels} from '@react-aria/utils';

function ActionMenu<T extends object>(props: SpectrumActionMenuProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  let labelProps = useLabels(props);
  if (labelProps['aria-label'] === undefined) {
    labelProps['aria-label'] = 'More actions';
  }
  
  return (
    <MenuTrigger 
      align={props.align} 
      direction={props.direction} 
      shouldFlip={props.shouldFlip}>
      <ActionButton 
        ref={ref} 
        {...labelProps} 
        isDisabled={props.isDisabled}
        isQuiet={props.isQuiet}
        autoFocus={props.autoFocus}>
        <More />
      </ActionButton>
      <Menu 
        children={props.children} 
        items={props.items} 
        disabledKeys={props.disabledKeys} />
    </MenuTrigger>
  );
}

let _ActionMenu = React.forwardRef(ActionMenu);
export {_ActionMenu as ActionMenu};
