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

import {AriaMenuProps, FocusScope, mergeProps, useHover, useMenu, useMenuItem, useMenuSection, useMenuTrigger, useSubmenuTrigger} from 'react-aria';
import {BaseCollection, Collection, CollectionBuilder, CollectionNode, createBranchComponent, createLeafComponent, ItemNode, SectionNode} from '@react-aria/collections';
import {MenuTriggerProps as BaseMenuTriggerProps, Collection as ICollection, Node, RootMenuTriggerState, TreeState, useMenuTriggerState, useSubmenuTriggerState, useTreeState} from 'react-stately';
import {CollectionProps, CollectionRendererContext, ItemRenderProps, SectionContext, SectionProps, usePersistedKeys} from './Collection';
import {ContextValue, DEFAULT_SLOT, Provider, RenderProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps, useSlot, useSlottedContext} from './utils';
import {FieldInputContext, SelectableCollectionContext, SelectableCollectionContextValue} from './RSPContexts';
import {filterDOMProps, useObjectRef, useResizeObserver} from '@react-aria/utils';
import {FocusStrategy, forwardRefType, GlobalDOMAttributes, HoverEvents, Key, LinkDOMProps, MultipleSelection, PressEvents} from '@react-types/shared';
import {HeaderContext} from './Header';
import {KeyboardContext} from './Keyboard';
import {MultipleSelectionState, SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {OverlayTriggerStateContext} from './Dialog';
import {PopoverContext} from './Popover';
import {PressResponder} from '@react-aria/interactions';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  JSX,
  ReactElement,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SeparatorContext} from './Separator';
import {SharedElementTransition} from './SharedElementTransition';
import {TextContext} from './Text';

export const MenuContext = createContext<ContextValue<MenuProps<any>, HTMLDivElement>>(null);
export const MenuStateContext = createContext<TreeState<any> | null>(null);
export const RootMenuTriggerStateContext = createContext<RootMenuTriggerState | null>(null);
const SelectionManagerContext = createContext<SelectionManager | null>(null);

export interface MenuTriggerProps extends BaseMenuTriggerProps {
  children: ReactNode
}

export function MenuTrigger(props: MenuTriggerProps): JSX.Element {
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
  let scrollRef = useRef(null);

  return (
    <Provider
      values={[
        [MenuContext, {...menuProps, ref: scrollRef}],
        [OverlayTriggerStateContext, state],
        [RootMenuTriggerStateContext, state],
        [PopoverContext, {
          trigger: 'MenuTrigger',
          triggerRef: ref,
          scrollRef,
          placement: 'bottom start',
          style: {'--trigger-width': buttonWidth} as React.CSSProperties,
          'aria-labelledby': menuProps['aria-labelledby']
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

const SubmenuTriggerContext = createContext<{parentMenuRef: RefObject<HTMLElement | null>, shouldUseVirtualFocus?: boolean} | null>(null);

class SubmenuTriggerNode<T> extends CollectionNode<T> {
  static readonly type = 'submenutrigger';

  filter(collection: BaseCollection<T>, newCollection: BaseCollection<T>, filterFn: (textValue: string, node: Node<T>) => boolean): CollectionNode<T> | null {
    let triggerNode = collection.getItem(this.firstChildKey!);
    if (triggerNode && filterFn(triggerNode.textValue, this)) {
      let clone = this.clone();
      newCollection.addDescendants(clone, collection);
      return clone;
    }

    return null;
  }
}

/**
 * A submenu trigger is used to wrap a submenu's trigger item and the submenu itself.
 *
 * @version alpha
 */
export const SubmenuTrigger =  /*#__PURE__*/ createBranchComponent(SubmenuTriggerNode, (props: SubmenuTriggerProps, ref: ForwardedRef<HTMLDivElement>, item) => {
  let {CollectionBranch} = useContext(CollectionRendererContext);
  let state = useContext(MenuStateContext)!;
  let rootMenuTriggerState = useContext(RootMenuTriggerStateContext)!;
  let submenuTriggerState = useSubmenuTriggerState({triggerKey: item.key}, rootMenuTriggerState);
  let submenuRef = useRef<HTMLDivElement>(null);
  let itemRef = useObjectRef(ref);
  let {parentMenuRef, shouldUseVirtualFocus} = useContext(SubmenuTriggerContext)!;
  let {submenuTriggerProps, submenuProps, popoverProps} = useSubmenuTrigger({
    parentMenuRef,
    submenuRef,
    delay: props.delay,
    shouldUseVirtualFocus
  }, submenuTriggerState, itemRef);

  return (
    <Provider
      values={[
        [MenuItemContext, {...submenuTriggerProps, onAction: undefined, ref: itemRef}],
        [MenuContext, {
          ref: submenuRef,
          ...submenuProps
        }],
        [OverlayTriggerStateContext, submenuTriggerState],
        [PopoverContext, {
          trigger: 'SubmenuTrigger',
          triggerRef: itemRef,
          placement: 'end top',
          'aria-labelledby': submenuProps['aria-labelledby'],
          ...popoverProps
        }]
      ]}>
      <CollectionBranch collection={state.collection} parent={item} />
      {props.children[1]}
    </Provider>
  );
}, props => props.children[0]);

export interface MenuRenderProps {
  /**
   * Whether the menu has no items and should display its empty state.
   * @selector [data-empty]
   */
  isEmpty: boolean
}

export interface MenuProps<T> extends Omit<AriaMenuProps<T>, 'children'>, CollectionProps<T>, StyleRenderProps<MenuRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: () => ReactNode
}

/**
 * A menu displays a list of actions or options that a user can choose.
 */
export const Menu = /*#__PURE__*/ (forwardRef as forwardRefType)(function Menu<T extends object>(props: MenuProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, MenuContext);

  // Delay rendering the actual menu until we have the collection so that auto focus works properly.
  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <MenuInner props={props} collection={collection} menuRef={ref} />}
    </CollectionBuilder>
  );
});

interface MenuInnerProps<T> {
  // For now we append filter and other autocomplete context props here for typescript, but eventually we can consider exposing these
  // as top level props for users to use with standalone Menus
  props: MenuProps<T> & {filter?: SelectableCollectionContextValue<object>['filter'], shouldUseVirtualFocus?: boolean},
  collection: BaseCollection<object>,
  menuRef: RefObject<HTMLElement | null>
}

function MenuInner<T extends object>({props, collection, menuRef: ref}: MenuInnerProps<T>) {
  [props, ref] = useContextProps(props, ref, SelectableCollectionContext);
  let {filter, ...autocompleteMenuProps} = props;
  let filteredCollection = useMemo(() => filter ? collection.filter(filter) : collection, [collection, filter]);
  let state = useTreeState({
    ...props,
    collection: filteredCollection as ICollection<Node<object>>,
    children: undefined
  });
  let triggerState = useContext(RootMenuTriggerStateContext);
  let {isVirtualized, CollectionRoot} = useContext(CollectionRendererContext);
  let {menuProps} = useMenu({...props, isVirtualized, onClose: props.onClose || triggerState?.close}, state, ref);
  let renderProps = useRenderProps({
    defaultClassName: 'react-aria-Menu',
    className: props.className,
    style: props.style,
    values: {
      isEmpty: state.collection.size === 0
    }
  });

  let emptyState: ReactElement | null = null;
  if (state.collection.size === 0 && props.renderEmptyState) {
    emptyState = (
      <div
        role="menuitem"
        style={{display: 'contents'}}>
        {props.renderEmptyState()}
      </div>
    );
  }

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <FocusScope>
      <div
        {...mergeProps(DOMProps, renderProps, menuProps)}
        ref={ref as RefObject<HTMLDivElement>}
        slot={props.slot || undefined}
        data-empty={state.collection.size === 0 || undefined}
        onScroll={props.onScroll}>
        <Provider
          values={[
            [MenuStateContext, state],
            [SeparatorContext, {elementType: 'div'}],
            [SectionContext, {name: 'MenuSection', render: MenuSectionInner}],
            [SubmenuTriggerContext, {parentMenuRef: ref, shouldUseVirtualFocus: autocompleteMenuProps?.shouldUseVirtualFocus}],
            [MenuItemContext, null],
            [SelectableCollectionContext, null],
            [FieldInputContext, null],
            [SelectionManagerContext, state.selectionManager],
            /* Ensure root MenuTriggerState is defined, in case Menu is rendered outside a MenuTrigger. */
            /* We assume the context can never change between defined and undefined. */
            /* eslint-disable-next-line react-hooks/rules-of-hooks */
            [RootMenuTriggerStateContext, triggerState ?? useMenuTriggerState({})]
          ]}>
          <SharedElementTransition>
            <CollectionRoot
              collection={state.collection}
              persistedKeys={usePersistedKeys(state.selectionManager.focusedKey)}
              scrollRef={ref} />
          </SharedElementTransition>
        </Provider>
        {emptyState}
      </div>
    </FocusScope>
  );
}

export interface MenuSectionProps<T> extends SectionProps<T>, MultipleSelection {}

// A subclass of SelectionManager that forwards focus-related properties to the parent,
// but has its own local selection state.
class GroupSelectionManager extends SelectionManager {
  private parent: SelectionManager;

  constructor(parent: SelectionManager, state: MultipleSelectionState) {
    super(parent.collection, state);
    this.parent = parent;
  }

  get focusedKey() {
    return this.parent.focusedKey;
  }

  get isFocused() {
    return this.parent.isFocused;
  }

  setFocusedKey(key: Key | null, childFocusStrategy?: FocusStrategy): void {
    return this.parent.setFocusedKey(key, childFocusStrategy);
  }

  setFocused(isFocused: boolean): void {
    this.parent.setFocused(isFocused);
  }

  get childFocusStrategy() {
    return this.parent.childFocusStrategy;
  }
}

function MenuSectionInner<T extends object>(props: MenuSectionProps<T>, ref: ForwardedRef<HTMLElement>, section: Node<T>, className = 'react-aria-MenuSection') {
  let state = useContext(MenuStateContext)!;
  let {CollectionBranch} = useContext(CollectionRendererContext);
  let [headingRef, heading] = useSlot();
  let {headingProps, groupProps} = useMenuSection({
    heading,
    'aria-label': section.props['aria-label'] ?? undefined
  });
  let renderProps = useRenderProps({
    defaultClassName: className,
    className: section.props?.className,
    style: section.props?.style,
    values: {}
  });

  let parent = useContext(SelectionManagerContext)!;
  let selectionState = useMultipleSelectionState(props);
  let manager = props.selectionMode != null ? new GroupSelectionManager(parent, selectionState) : parent;

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;

  return (
    <section
      {...mergeProps(DOMProps, renderProps, groupProps)}
      ref={ref}>
      <Provider
        values={[
          [HeaderContext, {...headingProps, ref: headingRef}],
          [SelectionManagerContext, manager]
        ]}>
        <CollectionBranch collection={state.collection} parent={section} />
      </Provider>
    </section>
  );
}

/**
 * A MenuSection represents a section within a Menu.
 */
export const MenuSection = /*#__PURE__*/ createBranchComponent(SectionNode, MenuSectionInner);

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

export interface MenuItemProps<T = object> extends RenderProps<MenuItemRenderProps>, LinkDOMProps, HoverEvents, PressEvents, Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
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

const MenuItemContext = createContext<ContextValue<MenuItemProps, HTMLDivElement>>(null);

/**
 * A MenuItem represents an individual action in a Menu.
 */
export const MenuItem = /*#__PURE__*/ createLeafComponent(ItemNode, function MenuItem<T extends object>(props: MenuItemProps<T>, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<T>) {
  [props, forwardedRef] = useContextProps(props, forwardedRef, MenuItemContext);
  let id = useSlottedContext(MenuItemContext)?.id as string;
  let state = useContext(MenuStateContext)!;
  let ref = useObjectRef<any>(forwardedRef);
  let selectionManager = useContext(SelectionManagerContext)!;

  let {menuItemProps, labelProps, descriptionProps, keyboardShortcutProps, ...states} = useMenuItem({
    ...props,
    id,
    key: item.key,
    selectionManager
  }, state, ref);

  let {hoverProps, isHovered} = useHover({
    isDisabled: states.isDisabled
  });
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-MenuItem',
    values: {
      ...states,
      isHovered,
      isFocusVisible: states.isFocusVisible,
      selectionMode: selectionManager.selectionMode,
      selectionBehavior: selectionManager.selectionBehavior,
      hasSubmenu: !!props['aria-haspopup'],
      isOpen: props['aria-expanded'] === 'true'
    }
  });

  let ElementType: React.ElementType = props.href ? 'a' : 'div';
  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <ElementType
      {...mergeProps(DOMProps, renderProps, menuItemProps, hoverProps)}
      ref={ref}
      data-disabled={states.isDisabled || undefined}
      data-hovered={isHovered || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={states.isFocusVisible || undefined}
      data-pressed={states.isPressed || undefined}
      data-selected={states.isSelected || undefined}
      data-selection-mode={selectionManager.selectionMode === 'none' ? undefined : selectionManager.selectionMode}
      data-has-submenu={!!props['aria-haspopup'] || undefined}
      data-open={props['aria-expanded'] === 'true' || undefined}>
      <Provider
        values={[
          [TextContext, {
            slots: {
              [DEFAULT_SLOT]: labelProps,
              label: labelProps,
              description: descriptionProps
            }
          }],
          [KeyboardContext, keyboardShortcutProps],
          [SelectionIndicatorContext, {isSelected: states.isSelected}]
        ]}>
        {renderProps.children}
      </Provider>
    </ElementType>
  );
});
