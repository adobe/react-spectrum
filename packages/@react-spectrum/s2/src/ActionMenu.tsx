import {ActionButton, ActionButtonProps} from './ActionButton';
import {Menu, MenuProps, MenuTrigger, MenuTriggerProps} from './Menu';
import {StyleProps} from './style-utils' with { type: 'macro' };
import {FocusableRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {forwardRef} from 'react';
import MoreIcon from './wf-icons/More';

interface ActionMenuProps<T> extends
  Pick<MenuTriggerProps, 'isOpen' | 'defaultOpen' | 'onOpenChange' | 'align' | 'direction' | 'shouldFlip'>,
  Pick<MenuProps<T>, 'children' | 'items' | 'disabledKeys' | 'onAction' | 'size'>,
  Omit<ActionButtonProps, 'children' | 'size' | 'staticColor'>,
  StyleProps {
  // keep static color?
  }

function ActionMenu<T extends object>(props: ActionMenuProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  let buttonProps = filterDOMProps(props, {labelable: true});

  // size independently controlled?
  return (
    <MenuTrigger
      isOpen={props.isOpen}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      align={props.align}
      direction={props.direction}
      shouldFlip={props.shouldFlip}>
      <ActionButton
        ref={ref}
        aria-label="Help"
        size={props.size}
        isDisabled={props.isDisabled}
        autoFocus={props.autoFocus}
        isQuiet={props.isQuiet}
        {...buttonProps}>
        <MoreIcon />
      </ActionButton>
      <Menu
        items={props.items}
        disabledKeys={props.disabledKeys}
        onAction={props.onAction}
        size={props.size}>
        {/* @ts-ignore TODO: fix type, right now this component is the same as Menu */}
        {props.children}
      </Menu>
    </MenuTrigger>
  );
}

let _ActionMenu = forwardRef(ActionMenu);
export {_ActionMenu as ActionMenu};
