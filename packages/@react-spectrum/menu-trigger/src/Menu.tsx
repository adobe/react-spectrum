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
import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {CollectionBase, Expandable, MultipleSelection, StyleProps} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {Item, ListLayout, Node, Section} from '@react-stately/collections';
import {MenuContext} from './context';
import {mergeProps, useId} from '@react-aria/utils';
import React, {Fragment, useContext, useEffect, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {TreeState, useTreeState} from '@react-stately/tree';
import {useMenu} from '@react-aria/menu-trigger';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

export {Item, Section};

interface MenuProps<T> extends CollectionBase<T>, Expandable, MultipleSelection, DOMProps, StyleProps {
  autoFocus?: boolean, // whether or not to autoFocus on Menu opening (default behavior TODO)
}

export function Menu<T>(props: MenuProps<T>) {
  let layout = useMemo(() =>
    new ListLayout({
      rowHeight: 32, // Feel like we should eventually calculate this number (based on the css)? It should probably get a multiplier in order to gracefully handle scaling
      headingHeight: 31 // Same as above
    })
  , []);

  let contextProps = useContext(MenuContext);
  let completeProps = {
    ...mergeProps(contextProps, props),
    selectionMode: props.selectionMode || 'single'
  };

  let state = useTreeState(completeProps);
  let {menuProps} = useMenu(completeProps, state, layout);
  let {styleProps} = useStyleProps(completeProps);
  let menuContext = mergeProps(menuProps, completeProps);

  let {
    focusStrategy,
    setFocusStrategy,
    autoFocus = true,
    ...otherProps
  } = completeProps;

  useEffect(() => {
    // By default, attempt to focus first item upon opening menu
    let focusedKey = layout.getFirstKey();
    let selectionManager = state.selectionManager;
    let selectedKeys = selectionManager.selectedKeys;
    selectionManager.setFocused(true);

    // Focus last item if focusStrategy is 'last' (i.e. ArrowUp opening the menu)
    if (focusStrategy && focusStrategy === 'last') {
      focusedKey = layout.getLastKey();

      // Reset focus strategy so it doesn't get applied to future menu openings
      setFocusStrategy('first');
    }

    // Perhaps the below block goes into useSelectableCollection
    // Should autoFocus always be true so that Menu attempts to focus the first selected item? Maybe remove the prop entirely
    if (autoFocus) {
      // TODO: add other default focus behaviors
      // Focus the first selected key (if any)
      if (selectedKeys.size) {
        focusedKey = selectedKeys.values().next().value;
      }
    }

    selectionManager.setFocusedKey(focusedKey);
  }, [autoFocus, focusStrategy, layout, setFocusStrategy, state.selectionManager]);

  return (
    <MenuContext.Provider value={menuContext}>
      <CollectionView
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...menuProps}
        focusedKey={state.selectionManager.focusedKey}
        className={
          classNames(
            styles,
            'spectrum-Menu',
            styleProps.className
          )
        }
        layout={layout}
        collection={state.tree}>
        {(type, item: Node<T>) => {
          if (type === 'section') {
            // Only render the Divider if it isn't the first Heading (extra equality check to guard against rerenders)
            if (item.key === state.tree.getKeys().next().value) {
              return (
                <MenuHeading item={item} />
              );
            } else {
              return (
                <Fragment>
                  <MenuDivider />
                  <MenuHeading item={item} />
                </Fragment>
              );
            }
          }

          return (
            <MenuItem
              item={item}
              state={state} />
          );
        }}
      </CollectionView>
    </MenuContext.Provider>
  );
}

interface MenuItemProps<T> {
  item: Node<T>,
  state: TreeState<T>
}

// For now export just to see what it looks like, remove after
// Placeholder for now, Rob's pull will make the real menuItem
// How would we get MenuItem user specified props in?
function MenuItem<T>({item, state}: MenuItemProps<T>) {
  let menuProps = useContext(MenuContext) || {};
  let {
    rendered,
    isSelected,
    isDisabled
  } = item;

  // TODO: All of the below should be in a useMenuItem aria hook, to be handled in MenuItem pull
  // The hook should also setup behavior on Enter/Space etc, overriding/merging with the above itemProps returned by useSelectableItem
  let ref = useRef<HTMLDivElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: item.key,
    itemRef: ref
  });

  let menuItemProps = {
    'aria-disabled': isDisabled,
    ref,
    id: useId(),
    role: 'menuitem'
  };

  if (menuProps.role === 'listbox') {
    menuItemProps.role = 'option';
    menuItemProps['aria-selected'] = isSelected ? 'true' : 'false';
  } else if (menuProps.selectionMode === 'single') {
    menuItemProps.role = 'menuitemradio';
    menuItemProps['aria-checked'] = isSelected ? 'true' : 'false';
  } else if (menuProps.selectionMode === 'multiple') {
    menuItemProps.role = 'menuitemcheckbox';
    menuItemProps['aria-checked'] = isSelected ? 'true' : 'false';
  }

  let onKeyDown = (e) => {
    let role = menuItemProps.role;

    switch (e.key) {
      case ' ':
        if (!isDisabled) {
          if (role !== 'menuitemcheckbox' && role !== 'menuitemradio' && role !== 'option') {
            menuProps.setOpen && menuProps.setOpen(false);
          }
        }
        break;
      case 'Enter':
        if (!isDisabled) {
          menuProps.setOpen && menuProps.setOpen(false);
        }
        break;
    }
  };

  let onPress = (e) => {
    if (e.pointerType !== 'keyboard') {
      menuProps.setOpen && menuProps.setOpen(false);
    }
  };

  let onMouseOver = () => state.selectionManager.setFocusedKey(item.key);
  // Note: the ref below is needed so that a menuItem with children serves as a MenuTrigger properly
  // Add it if we like that behavior but remove if/when we make a subMenu item/trigger component
  // let {pressProps} = usePress(mergeProps({onPressStart}, {...itemProps, ref}));

  // The below allows the user to properly cycle through all choices via up/down arrow (suppresses up and down from triggering submenus by not including the ref).
  // isDisabled suppresses sub menu triggers from firing
  let {pressProps} = usePress(mergeProps({onPress}, mergeProps({onKeyDown}, {...itemProps, isDisabled: isDisabled})));

  // Will need additional aria-owns and stuff when submenus are finalized
  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...mergeProps(pressProps, filterDOMProps(itemProps))}
        {...menuItemProps}
        onMouseOver={onMouseOver}
        onFocus={() => {}}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-disabled': isDisabled,
            'is-selected': isSelected
          }
        )}>
        <span
          className={classNames(
            styles,
            'spectrum-Menu-itemLabel')}>
          {rendered}
        </span>
        {isSelected && <CheckmarkMedium  UNSAFE_className={classNames(styles, 'spectrum-Menu-checkmark')} />}
      </div>
    </FocusRing>
  );
}

function MenuDivider() {
  return (
    <div
      aria-orientation="horizontal"
      className={classNames(
        styles,
        'spectrum-Menu-divider'
      )}
      role="separator" />
  );
}

interface MenuHeadingProps<T> {
  item: Node<T>
}

function MenuHeading<T>({item}: MenuHeadingProps<T>) {
  return (
    <div role="presentation">
      <span
        aria-level={3}
        role="heading"
        className={classNames(
          styles,
          'spectrum-Menu-sectionHeading')}>
        {item.rendered}
      </span>
    </div>
  );
}
