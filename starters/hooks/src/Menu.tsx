'use client';
import {useMenuTrigger, useMenu, useMenuItem, type AriaMenuOptions} from 'react-aria/useMenu';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useMenuTriggerState} from 'react-stately/useMenuTriggerState';
import {useTreeState, type TreeProps, type TreeState} from 'react-stately/useTreeState';
import {CollectionBuilder, createLeafComponent} from 'react-aria/CollectionBuilder';
import {ItemNode} from 'react-aria/private/collections/BaseCollection';
import {Collection} from 'react-aria-components/Collection';
import {Button, ButtonContext} from 'react-aria-components/Button';
import {OverlayTriggerStateContext} from 'react-aria-components/Dialog';
import {Popover, PopoverContext} from 'react-aria-components/Popover';
import {Provider} from 'react-aria-components/slots';
import type {Collection as ICollection, Key, Node} from '@react-types/shared';
import {Ellipsis} from 'lucide-react';
import {createContext, Fragment, useContext, useRef} from 'react';
import type {ForwardedRef, ReactNode} from 'react';
import './Button.css';
import './Menu.css';
import './Popover.css';

let TreeStateContext = createContext<TreeState<object> | null>(null);

export interface MenuItemProps {
  id?: Key;
  textValue?: string;
  children?: ReactNode;
}

export const MenuItem = createLeafComponent(
  ItemNode,
  function MenuItem(
    _props: MenuItemProps,
    forwardedRef: ForwardedRef<HTMLLIElement>,
    item: Node<object>
  ) {
    let state = useContext(TreeStateContext)!;
    let ref = useObjectRef(forwardedRef);
    let {menuItemProps, isFocused, isDisabled, isPressed} = useMenuItem(
      {key: item.key},
      state,
      ref
    );

    return (
      <li
        {...menuItemProps}
        ref={ref}
        className="react-aria-MenuItem"
        data-focused={isFocused || undefined}
        data-disabled={isDisabled || undefined}
        data-pressed={isPressed || undefined}>
        {typeof item.rendered === 'string' ? (
          <span slot="label">{item.rendered}</span>
        ) : (
          item.rendered
        )}
      </li>
    );
  }
);

export function MenuButton(
  props: Parameters<typeof useMenuTriggerState>[0] &
    AriaMenuOptions<object> &
    TreeProps<object> & {children?: ReactNode}
) {
  let state = useMenuTriggerState(props);
  let ref = useRef<HTMLButtonElement>(null);
  let {menuTriggerProps, menuProps} = useMenuTrigger({}, state, ref);

  return (
    <Provider
      values={[
        [ButtonContext, {...menuTriggerProps, ref, isPressed: state.isOpen}],
        [OverlayTriggerStateContext, state],
        [PopoverContext, {trigger: 'MenuTrigger', triggerRef: ref, placement: 'bottom start'}]
      ]}>
      <Button
        aria-label={props['aria-label']}
        className="react-aria-Button button-base"
        data-variant="primary">
        <Ellipsis size={18} />
      </Button>
      <Popover className="react-aria-Popover">
        <Menu {...(menuProps as AriaMenuOptions<object>)} {...props} />
      </Popover>
    </Provider>
  );
}

function Menu(props: AriaMenuOptions<object> & TreeProps<object>) {
  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <MenuInner {...props} collection={collection} />}
    </CollectionBuilder>
  );
}

function MenuInner({
  collection,
  ...props
}: AriaMenuOptions<object> &
  Omit<TreeProps<object>, 'children'> & {
    collection: ICollection<Node<object>>;
  }) {
  let state = useTreeState({...props, collection, children: undefined});
  let ref = useRef<HTMLUListElement>(null);
  let {menuProps} = useMenu(props, state, ref);

  return (
    <ul {...menuProps} ref={ref} className="react-aria-Menu">
      <TreeStateContext.Provider value={state}>
        {[...state.collection].map(item => (
          <Fragment key={item.key}>{item.render!(item)}</Fragment>
        ))}
      </TreeStateContext.Provider>
    </ul>
  );
}
