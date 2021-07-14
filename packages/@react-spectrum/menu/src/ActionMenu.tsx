import {ActionButton} from '@react-spectrum/button';
import {filterDOMProps} from '@react-aria/utils';
import {FocusableRef} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Menu} from './Menu';
import {MenuTrigger} from './MenuTrigger';
import More from '@spectrum-icons/workflow/More';
import React from 'react';
import {SpectrumActionMenuProps} from '@react-types/menu';
import {useMessageFormatter} from '@react-aria/i18n';

function ActionMenu<T extends object>(props: SpectrumActionMenuProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  let formatMessage = useMessageFormatter(intlMessages);
  let buttonProps = filterDOMProps(props, {labelable: true});
  if (buttonProps['aria-label'] === undefined) {
    buttonProps['aria-label'] = formatMessage('more-actions');
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
