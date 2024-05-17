/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


import {AriaMenuProps, FocusScope, mergeProps, useFocusRing, useMenu, useMenuItem, useMenuSection, useMenuTrigger} from 'react-aria';
import {BaseCollection, CollectionProps, ItemRenderProps, useCachedChildren, useCollection, useSSRCollectionNode} from './Collection';
import {MenuTriggerProps as BaseMenuTriggerProps, Node, TreeState, useMenuTriggerState, useTreeState} from 'react-stately';
import {ContextValue, forwardRefType, Provider, RenderProps, ScrollableProps, SlotProps, StyleProps, useContextProps, useRenderProps, useSlot, useSlottedContext} from './utils';
import {filterDOMProps, mergeRefs, useObjectRef, useResizeObserver} from '@react-aria/utils';
import {Header} from './Header';
import {HoverEvents, Key, LinkDOMProps} from '@react-types/shared';
import {KeyboardContext} from './Keyboard';
import {OverlayTriggerStateContext} from './Dialog';
import {PopoverContext, PopoverProps} from './Popover';
import {PressResponder, useHover, useInteractOutside} from '@react-aria/interactions';
import React, {createContext, ForwardedRef, forwardRef, ReactElement, ReactNode, RefObject, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {RootMenuTriggerState, useSubmenuTriggerState} from '@react-stately/menu';
import {Separator, SeparatorContext} from './Separator';
import {TextContext} from './Text';
import {useSubmenuTrigger} from '@react-aria/menu';

export const MenuContext = createContext<ContextValue<MenuProps<any>, HTMLDivElement>>(null);
export const MenuStateContext = createContext<TreeState<unknown> | null>(null);
export const RootMenuTriggerStateContext = createContext<RootMenuTriggerState | null>(null);

export interface MenuTriggerProps extends BaseMenuTriggerProps {
  children: ReactNode
}

export function MenuTrigger(props: MenuTriggerProps) {
  let state = useMenuTriggerState(props);

  let ref = useRef<HTMLButtonElement>(null);
  let {menuTriggerProps, menuProps} = useMenuTrigger({
    ...props,
    type: 'menu'
  }, state, ref);
  // Allows menu width to match button
  let [buttonWidth, setButtonWidth] = useState<string | null>(null);
  let onResize = useCallback(() => {
    if (ref.current) {
      setButtonWidth(ref.current.offsetWidth + 'px');
    }
  }, [ref]);

  useResizeObserver({
    ref: ref,
    onResize: onResize
  });

  return (
    <Provider
      values={[
        [MenuContext, menuProps],
        [OverlayTriggerStateContext, state],
        [RootMenuTriggerStateContext, state],
        [PopoverContext, {
          trigger: 'MenuTrigger',
          triggerRef: ref,
          placement: 'bottom start',
          style: {'--trigger-width': buttonWidth} as React.CSSProperties
        }]
      ]}>
      <PressResponder {...menuTriggerProps} ref={ref} isPressed={state.isOpen}>
        {props.children}
      </PressResponder>
    </Provider>
  );
}

export interface SubmenuTriggerProps {
  /**
   * The contents of the SubmenuTrigger. The first child should be an Item (the trigger) and the second child should be the Popover (for the submenu).
   */
  children: ReactElement[],
  /**
   * The delay time in milliseconds for the submenu to appear after hovering over the trigger.
   * @default 200
   */
  delay?: number
}

/**
 * A submenu trigger is used to wrap a submenu's trigger item and the submenu itself.
 *
 * @version alpha
 */
export function SubmenuTrigger(props: SubmenuTriggerProps, ref: ForwardedRef<HTMLDivElement>): JSX.Element | null {
  return useSSRCollectionNode('submenutrigger', props, ref, props.children, props.children[0]);
}

function SubmenuTriggerInner(props) {
  let {item, parentMenuRef} = props;
  let state = useContext(MenuStateContext)!;

  let children = useCachedChildren({
    items: state.collection.getChildren!(item.key),
    children: childItem => {
      switch (childItem.type) {
        case 'item':
          return <MenuItemTriggerInner item={childItem} popover={item.rendered[1]} parentMenuRef={parentMenuRef} delay={item.props.delay} />;
        default:
          throw new Error('Unsupported element type in SubmenuTrigger: ' + item.type);
      }
    }
  });

  return children;
}


export interface MenuProps<T> extends Omit<AriaMenuProps<T>, 'children'>, CollectionProps<T>, StyleProps, SlotProps, ScrollableProps<HTMLDivElement> {}

function Menu<T extends object>(props: MenuProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, MenuContext);
  let {portal, collection} = useCollection(props);

  // Delay rendering the actual menu until we have the collection so that auto focus works properly.
  return (
    <>
      {collection.size > 0 && <MenuInner props={props} collection={collection} menuRef={ref} />}
      {portal}
    </>
  );
}

interface MenuInnerProps<T> {
  props: MenuProps<T>,
  collection: BaseCollection<T>,
  menuRef: RefObject<HTMLDivElement>
}

function MenuInner<T extends object>({props, collection, menuRef: ref}: MenuInnerProps<T>) {
  let state = useTreeState({
    ...props,
    collection,
    children: undefined
  });
  let [popoverContainer, setPopoverContainer] = useState<HTMLDivElement | null>(null);
  let {menuProps} = useMenu(props, state, ref);
  let rootMenuTriggerState = useContext(RootMenuTriggerStateContext)!;
  let popoverContext = useContext(PopoverContext)!;

  let children = useCachedChildren({
    items: state.collection,
    children: (item) => {
      switch (item.type) {
        case 'section':
          return <MenuSection section={item} parentMenuRef={ref} />;
        case 'separator':
          return <Separator {...item.props} />;
        case 'item':
          return <MenuItemInner item={item} />;
        case 'submenutrigger':
          return <SubmenuTriggerInner item={item} parentMenuRef={ref} />;
        default:
          throw new Error('Unsupported node type in Menu: ' + item.type);
      }
    }
  });

  let isSubmenu = (popoverContext as PopoverProps)?.trigger === 'SubmenuTrigger';
  useInteractOutside({
    ref,
    onInteractOutside: (e) => {
      if (rootMenuTriggerState && !popoverContainer?.contains(e.target as HTMLElement)) {
        rootMenuTriggerState.close();
      }
    },
    isDisabled: isSubmenu || rootMenuTriggerState?.expandedKeysStack.length === 0
  });

  let prevPopoverContainer = useRef<HTMLDivElement | null>(null) ;
  let [leftOffset, setLeftOffset] = useState({left: 0});
  useEffect(() => {
    if (popoverContainer && prevPopoverContainer.current !== popoverContainer && leftOffset.left === 0) {
      prevPopoverContainer.current = popoverContainer;
      let {left} = popoverContainer.getBoundingClientRect();
      setLeftOffset({left: -1 * left});
    }
  }, [leftOffset, popoverContainer]);

  return (
    <FocusScope>
      <div
        {...filterDOMProps(props)}
        {...menuProps}
        ref={ref}
        slot={props.slot || undefined}
        onScroll={props.onScroll}
        style={props.style}
        className={props.className ?? 'react-aria-Menu'}>
        <Provider
          values={[
            [MenuStateContext, state],
            [SeparatorContext, {elementType: 'div'}],
            [PopoverContext, {UNSTABLE_portalContainer: popoverContainer || undefined}]
          ]}>
          {children}
        </Provider>
      </div>
      <div ref={setPopoverContainer} style={{width: '100vw', position: 'absolute', top: 0, ...leftOffset}} />
    </FocusScope>
  );
}

/**
 * A menu displays a list of actions or options that a user can choose.
 */
const _Menu = /*#__PURE__*/ (forwardRef as forwardRefType)(Menu);
export {_Menu as Menu};

interface MenuSectionProps<T> extends StyleProps {
  section: Node<T>,
  parentMenuRef: RefObject<HTMLDivElement>
}

function MenuSection<T>({section, className, style, parentMenuRef, ...otherProps}: MenuSectionProps<T>) {
  let state = useContext(MenuStateContext)!;
  let [headingRef, heading] = useSlot();
  let {headingProps, groupProps} = useMenuSection({
    heading,
    'aria-label': section['aria-label'] ?? undefined
  });

  let children = useCachedChildren({
    items: state.collection.getChildren!(section.key),
    children: item => {
      switch (item.type) {
        case 'header': {
          let {ref, ...otherProps} = item.props;
          return (
            <Header
              {...headingProps}
              {...otherProps}
              ref={mergeRefs(headingRef, ref)}>
              {item.rendered}
            </Header>
          );
        }
        case 'item':
          return <MenuItemInner item={item} />;
        case 'submenutrigger':
          return <SubmenuTriggerInner item={item} parentMenuRef={parentMenuRef} />;
        default:
          throw new Error('Unsupported element type in Section: ' + item.type);
      }
    }
  });

  return (
    <section
      {...filterDOMProps(otherProps)}
      {...groupProps}
      className={className || section.props?.className || 'react-aria-Section'}
      style={style || section.props?.style}
      ref={section.props.ref}>
      {children}
    </section>
  );
}

export interface MenuItemRenderProps extends ItemRenderProps {
  /**
   * Whether the item has a submenu.
   *
   * @selector [data-has-submenu]
   */
  hasSubmenu: boolean,
  /**
   * Whether the item's submenu is open.
   *
   * @selector [data-open]
   */
  isOpen: boolean
}

export interface MenuItemProps<T = object> extends RenderProps<MenuItemRenderProps>, LinkDOMProps, HoverEvents {
  /** The unique id of the item. */
  id?: Key,
  /** The object value that this item represents. When using dynamic collections, this is set automatically. */
  value?: T,
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string,
  /** An accessibility label for this item. */
  'aria-label'?: string,
  /** Whether the item is disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the item is selected. */
  onAction?: () => void
}

function MenuItem<T extends object>(props: MenuItemProps<T>, ref: ForwardedRef<HTMLDivElement>): JSX.Element | null {
  return useSSRCollectionNode('item', props, ref, props.children);
}

/**
 * A MenuItem represents an individual action in a Menu.
 */
const _MenuItem = /*#__PURE__*/ (forwardRef as forwardRefType)(MenuItem);
export {_MenuItem as MenuItem};

interface MenuItemInnerProps<T> {
  item: Node<T>
}

function MenuItemInner<T>({item}: MenuItemInnerProps<T>) {
  let state = useContext(MenuStateContext)!;
  let ref = useObjectRef<any>(item.props.ref);
  let {menuItemProps, labelProps, descriptionProps, keyboardShortcutProps, ...states} = useMenuItem({key: item.key, 'aria-label': item.props?.['aria-label']}, state, ref);

  let props: MenuItemProps<T> = item.props;
  let {isFocusVisible, focusProps} = useFocusRing();
  let {hoverProps, isHovered} = useHover({
    isDisabled: states.isDisabled,
    onHoverStart: item.props.onHoverStart,
    onHoverChange: item.props.onHoverChange,
    onHoverEnd: item.props.onHoverEnd
  });
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-MenuItem',
    values: {
      ...states,
      isHovered,
      isFocusVisible,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior,
      hasSubmenu: false,
      isOpen: false
    }
  });

  let ElementType: React.ElementType = props.href ? 'a' : 'div';

  return (
    <ElementType
      {...mergeProps(menuItemProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      data-disabled={states.isDisabled || undefined}
      data-hovered={isHovered || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={states.isPressed || undefined}
      data-selected={states.isSelected || undefined}
      data-selection-mode={state.selectionManager.selectionMode === 'none' ? undefined : state.selectionManager.selectionMode}>
      <Provider
        values={[
          [TextContext, {
            slots: {
              label: labelProps,
              description: descriptionProps
            }
          }],
          [KeyboardContext, keyboardShortcutProps]
        ]}>
        {renderProps.children}
      </Provider>
    </ElementType>
  );
}

interface MenuItemTriggerInnerProps<T> {
  item: Node<T>,
  popover: ReactElement,
  parentMenuRef: RefObject<HTMLDivElement>,
  delay?: number
}

function MenuItemTriggerInner<T>({item, popover, parentMenuRef, delay}: MenuItemTriggerInnerProps<T>) {
  let state = useContext(MenuStateContext)!;
  let popoverContext = useSlottedContext(PopoverContext)!;
  let ref = useObjectRef<any>(item.props.ref);
  let rootMenuTriggerState = useContext(RootMenuTriggerStateContext)!;
  let submenuTriggerState = useSubmenuTriggerState({triggerKey: item.key}, rootMenuTriggerState);
  let submenuRef = useRef<HTMLDivElement>(null);
  let {submenuTriggerProps, submenuProps, popoverProps} = useSubmenuTrigger({
    node: item,
    parentMenuRef,
    submenuRef,
    delay
  }, submenuTriggerState, ref);
  let {menuItemProps, labelProps, descriptionProps, keyboardShortcutProps, ...states} = useMenuItem({
    key: item.key,
    ...submenuTriggerProps
  }, state, ref);
  let props: MenuItemProps<T> = item.props;
  let {hoverProps, isHovered} = useHover({isDisabled: states.isDisabled});
  let {isFocusVisible, focusProps} = useFocusRing();
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-MenuItem',
    values: {
      ...states,
      isHovered,
      isFocusVisible,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior,
      hasSubmenu: true,
      isOpen: submenuTriggerState.isOpen
    }
  });

  return (
    <Provider
      values={[
        [TextContext, {
          slots: {
            label: labelProps,
            description: descriptionProps
          }
        }],
        [KeyboardContext, keyboardShortcutProps],
        [MenuContext, submenuProps],
        [OverlayTriggerStateContext, submenuTriggerState],
        [PopoverContext, {
          ref: submenuRef,
          trigger: 'SubmenuTrigger',
          triggerRef: ref,
          placement: 'end top',
          UNSTABLE_portalContainer: popoverContext.UNSTABLE_portalContainer || undefined,
          ...popoverProps
        }]
      ]}>
      <div
        {...mergeProps(menuItemProps, focusProps, hoverProps)}
        {...renderProps}
        ref={ref}
        data-disabled={states.isDisabled || undefined}
        data-hovered={isHovered || undefined}
        data-focused={states.isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-pressed={states.isPressed || undefined}
        data-selected={states.isSelected || undefined}
        data-selection-mode={state.selectionManager.selectionMode === 'none' ? undefined : state.selectionManager.selectionMode}
        data-has-submenu
        data-open={submenuTriggerState.isOpen || undefined}>
        {renderProps.children}
      </div>
      {popover}
    </Provider>
  );
}
