/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// TODO for docs, convert to react-aria and react-stately mono package imports
import {AriaPopoverProps, DismissButton, Overlay, usePopover} from '@react-aria/overlays';
import {Item} from '@react-stately/collections';
import React, {cloneElement, createContext, MutableRefObject, ReactElement, ReactNode, useContext, useMemo, useRef, useState} from 'react';
import {useButton} from '@react-aria/button';
import {AriaMenuProps, UNSTABLE_useSubmenuTrigger, useMenu, useMenuItem, useMenuTrigger} from '@react-aria/menu';
import {MenuTriggerProps, MenuTriggerState, UNSTABLE_useSubmenuTriggerState, useMenuTriggerState} from '@react-stately/menu';
import {TreeState, useTreeState} from '@react-stately/tree';
import {OverlayTriggerState} from '@react-stately/overlays';
import {useMenuSection, useSeparator, mergeProps} from 'react-aria';
import styles from './index.css';
import { mergeRefs, useLayoutEffect, useObjectRef } from '@react-aria/utils';
import { action } from '@storybook/addon-actions';

export default {
  title: 'useSubmenuTrigger'
};

export const BaseExample = {
  render: () => (
    <MenuButton label="Actions">
      <Item key="copy">Copy</Item>
      <Item key="cut">Cut</Item>
      <Item key="paste">Paste</Item>
    </MenuButton>

  ),
  name: 'base menu example'
};

export const SubmenuExample = {
  render: () => (
    <MenuButton label="Actions" selectionMode="multiple" onAction={action('onaction')}>
      <Item key="copy">Copy</Item>
      <SubmenuTrigger>
        <Item key="cut">Cut</Item>
        <Menu>
          <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
          <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
          <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
        </Menu>
      </SubmenuTrigger>
      <Item key="paste">Paste</Item>
    </MenuButton>
  ),
  name: 'submenu example'
};

interface MenuButtonProps<T> extends AriaMenuProps<T>, MenuTriggerProps {
  label?: string
}
interface RootMenuContextValue {
  rootMenuTriggerState: MenuTriggerState
}
const RootMenuContext = createContext<RootMenuContextValue>(undefined);
function useRootMenuContext() {
  return useContext(RootMenuContext);
}

function MenuButton<T extends object>(props: MenuButtonProps<T>) {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the button and menu elements
  let ref = useRef(null);
  let {menuTriggerProps, menuProps} = useMenuTrigger<T>({}, state, ref);

  return (
    <RootMenuContext.Provider value={{rootMenuTriggerState: state}}>
      <Button
        {...menuTriggerProps}
        buttonRef={ref}
        style={{height: 30, fontSize: 14}}>
        {props.label}
        <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
      </Button>
      {state.isOpen &&
        (
          <Popover state={state} triggerRef={ref} placement="bottom start">
            <Menu
              {...props}
              {...menuProps} />
          </Popover>
        )}
    </RootMenuContext.Provider>
  );
}

function Button(props) {
  let ref = props.buttonRef;
  let {buttonProps} = useButton(props, ref);
  return (
    <button {...buttonProps} ref={ref} style={props.style}>
      {props.children}
    </button>
  );
}

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: ReactNode,
  state: OverlayTriggerState,
  container?: Element,
  disableFocusManagement?: boolean
}

function Popover({children, state, container, disableFocusManagement, ...props}: PopoverProps) {
  let popoverRef = React.useRef(null);
  let {popoverProps, underlayProps} = usePopover({
    ...props,
    popoverRef
  }, state);

  return (
    <Overlay disableFocusManagement={disableFocusManagement} portalContainer={container}>
      {!props.isNonModal && <div {...underlayProps} style={{position: 'fixed', inset: 0}} />}
      <div
        {...popoverProps}
        ref={popoverRef}
        style={{
          ...popoverProps.style,
          background: 'lightgray',
          border: '1px solid gray'
        }}>
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}

// const MenuContext = createContext({});
// function useMenuContext() {
//   return useContext(MenuContext);
// }

// TODO rename menustatecontext to just Menucontext?
interface MenuStateContextValue<T> {
  menuRef: MutableRefObject<HTMLUListElement>,
  menuTreeState: TreeState<T>,
  popoverContainerRef: MutableRefObject<HTMLDivElement>
}
const MenuStateContext = createContext<MenuStateContextValue<any>>(undefined);
function useMenuStateContext() {
  return useContext(MenuStateContext);
}


interface MenuProps<T> extends AriaMenuProps<T> {}

function Menu<T extends object>(props: MenuProps<T>) {
  // TODO: do I need this popover ref? where to render the popover
  let popoverContainerRef = useRef(null);
  let [leftOffset, setLeftOffset] = useState({left: 0});
  useLayoutEffect(() => {
    let {left} = popoverContainerRef.current.getBoundingClientRect();
    setLeftOffset({left: -1 * left});
  }, []);


  // Create menu state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = useRef(null);
  let {menuProps} = useMenu(props, state, ref);

  // TODO: how best to communicate the root menu state down to Menu
  // perhaps if wrapper had the ability to accept arbitrary props I could then pass the root menu state via Menu's call of wrapper
  // same deal with how to pass menuRef and menuTreeState to the SubMenuTrigger here.
  // For now run with context, ask team later
  return (
    // TODO: need popoverCOntainerRef, tree state, domRef to menu??
    <MenuStateContext.Provider value={{menuRef: ref, menuTreeState: state, popoverContainerRef}}>
      <ul {...menuProps} className={styles.menu} ref={ref}>
        {[...state.collection].map(item => {
          if (item.type === 'section') {
            return (
              <MenuSection key={item.key} section={item} state={state} />
            );
          }

          let menuItem = (
            <MenuItem
              key={item.key}
              item={item}
              state={state}
              onAction={props.onAction} />
          );

          if (item.wrapper) {
            menuItem = item.wrapper(menuItem);
          }

          return menuItem;

        })}
        <div ref={popoverContainerRef} style={{width: '100vw', height: '1px', background: 'red', position: 'absolute', top: -5, ...leftOffset}} />
      </ul>
    </MenuStateContext.Provider>
  );
}

function MenuItem(props) {
  let {item, state, onAction, triggerRef} = props;
  let {key} = item;
  let isSubmenuTrigger = !!triggerRef;

    // Get props for the menu item element
  let isDisabled = state.disabledKeys.has(key);
  let isSelectable = !isSubmenuTrigger && state.selectionManager.selectionMode !== 'none';
  let isSelected = isSelectable && state.selectionManager.isSelected(key);
  let itemref = useRef<any>(null);
  let ref = useObjectRef(useMemo(() => mergeRefs(itemref, triggerRef), [itemref, triggerRef]));
  let {
    menuItemProps
  } = useMenuItem(
    {
      isSelected,
      isDisabled,
      'aria-label': item['aria-label'],
      key,
      onAction,
      ...props
    },
    state,
    ref
  );

  return (
    <li {...menuItemProps} className={styles.menuitem} ref={ref}>
      {item.rendered}
      {isSelected && <span aria-hidden="true">✅</span>}
    </li>
  );
}

function MenuSection({section, state}) {
  let {itemProps, headingProps, groupProps} = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label']
  });

  let {separatorProps} = useSeparator({
    elementType: 'li'
  });

  // If the section is not the first, add a separator element.
  // The heading is rendered inside an <li> element, which contains
  // a <ul> with the child items.
  return (
    <>
      {section.key !== state.collection.getFirstKey() &&
        (
          <li
            {...separatorProps}
            style={{
              borderTop: '1px solid gray',
              margin: '2px 5px'
            }} />
        )}
      <li {...itemProps}>
        {section.rendered &&
          (
            <span
              {...headingProps}
              style={{
                fontWeight: 'bold',
                fontSize: '1.1em',
                padding: '2px 5px'
              }}>
              {section.rendered}
            </span>
          )}
        <ul
          {...groupProps}
          style={{
            padding: 0,
            listStyle: 'none'
          }}>
          {[...section.childNodes].map((node) => (
            <MenuItem
              key={node.key}
              item={node}
              state={state} />
          ))}
        </ul>
      </li>
    </>
  );
}

function SubmenuTrigger(props) {
  // TODO: Get root menu state
  let {rootMenuTriggerState} = useRootMenuContext();

  let triggerRef = useRef<HTMLDivElement>();
  let {
    children,
    targetKey
  } = props;
  let menuRef = useRef<HTMLDivElement>(null);
  // TODO replace with children.forEach?
  let [menuTrigger, menu] = React.Children.toArray(children);
  let {popoverContainerRef, menuRef: parentMenuRef, menuTreeState} = useMenuStateContext();
  let triggerNode = menuTreeState.collection.getItem(targetKey);

  let submenuTriggerState = UNSTABLE_useSubmenuTriggerState({triggerKey: targetKey}, rootMenuTriggerState);
  let {submenuTriggerProps, submenuProps, popoverProps, overlayProps} = UNSTABLE_useSubmenuTrigger({
    node: triggerNode,
    parentMenuRef,
    submenuRef: menuRef
  }, submenuTriggerState, triggerRef);

  let overlay = (
    <Popover
      {...mergeProps(popoverProps, overlayProps)}
      container={popoverContainerRef?.current}
      offset={-10}
      containerPadding={0}
      crossOffset={-5}
      // enableBothDismissButtons
      // UNSAFE_style={{clipPath: 'unset', overflow: 'visible', borderWidth: '0px'}}
      // hideArrow
      state={submenuTriggerState}
      triggerRef={triggerRef}
      scrollRef={menuRef}
      placement="end top">
      {/* TODO: removed menu ref, don't think it is even used */}
      {cloneElement(menu as ReactElement, {...submenuProps})}
    </Popover>
  );

  return (
    <>
      {cloneElement(menuTrigger as ReactElement, {...submenuTriggerProps, triggerRef: triggerRef})}
      {submenuTriggerState.isOpen && overlay}
    </>
  );
}

SubmenuTrigger.getCollectionNode = function* (props) {
  let childArray = [];
  React.Children.forEach(props.children, child => {
    if (React.isValidElement(child)) {
      childArray.push(child);
    }
  });
  let [trigger, content] = childArray;

  yield {
    element: cloneElement(trigger, {...trigger.props, hasChildItems: true, isTrigger: true}),
    wrapper: (element) => (
      <SubmenuTrigger key={element.key} targetKey={element.key} {...props}>
        {element}
        {content}
      </SubmenuTrigger>
    )
  };
};
