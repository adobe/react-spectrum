import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {CollectionBase, Expandable, MultipleSelection, SelectionMode, StyleProps} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {focusStrategy, useMenu} from '@react-aria/menu-trigger';
import {Item, ListLayout, Node, Section} from '@react-stately/collections';
import {MenuContext} from './context';
import {MenuTrigger} from './';
import {mergeProps} from '@react-aria/utils';
import React, {Fragment, useContext, useEffect, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {TreeState, useTreeState} from '@react-stately/tree';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

export {Item, Section};

interface MenuProps<T> extends CollectionBase<T>, Expandable, MultipleSelection, DOMProps, StyleProps {
  onSelect?: (...args) => void, // user provided onSelect callback
  autoFocus?: boolean, // whether or not to autoFocus on Menu opening (default behavior TODO)
  focusStrategy?: React.MutableRefObject<focusStrategy> // internal prop to override autoFocus behavior, mainly for when user pressed up/down arrow
}

export function Menu<T>(props: MenuProps<T>) {
  let layout = useMemo(() => 
    new ListLayout({
      rowHeight: 32, // Feel like we should eventually calculate this number (based on the css)? It should probably get a multiplier in order to gracefully handle scaling
      headingHeight: 26 // Same as above
    })
  , []);

  let contextProps = useContext(MenuContext) || {};
  let completeProps = {
    ...mergeProps(contextProps, props),
    // TODO: make this configurable
    selectionMode: 'single' as SelectionMode
  };

  let state = useTreeState(completeProps);
  let {menuProps} = useMenu(completeProps, state, layout);
  let {styleProps} = useStyleProps(completeProps);
  let {
    onSelect,
    focusStrategy,
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
    if (focusStrategy && focusStrategy.current === 'last') {
      focusedKey = layout.getLastKey();

      // Reset focus strategy so it doesn't get applied to future menu openings
      focusStrategy.current = null;
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
  }, []);

  return (
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
      collection={state.tree}
      elementType="ul">
      {(type, item: Node<T>) => {
        if (type === 'section') {
          return (
            <Fragment>
              <MenuHeading item={item} />
              <MenuDivider />
            </Fragment>
          );
        }

        if (item.hasChildNodes) {
          return (
            <MenuTrigger>
              <MenuItem
                item={item}
                state={state}
                onSelect={onSelect} />
              <Menu items={item.childNodes} onSelect={onSelect}>
                {item => <Item childItems={item.childNodes}>{item.rendered}</Item>}
              </Menu>
            </MenuTrigger>
          );
        } else {
          return (
            <MenuItem
              item={item}
              state={state}
              onSelect={onSelect} />
          );
        }
      }}
    </CollectionView>
  );
}

interface MenuItemProps<T> {
  item: Node<T>,
  state: TreeState<T>,
  onSelect?: (...args) => void
}

// For now export just to see what it looks like, remove after
// Placeholder for now, Rob's pull will make the real menuItem
// How would we get MenuItem user specified props in?
function MenuItem<T>({item, state, onSelect}: MenuItemProps<T>) {
  let {
    rendered,
    isSelected,
    isDisabled,
    hasChildNodes
  } = item;

  let ref = useRef<HTMLLIElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: item.key,
    itemRef: ref
  });

  // TODO: should be in a useMenuItem aria hook
  // The hook should also setup behavior on Enter/Space etc, overriding/merging with the above itemProps returned by useSelectableItem  
  let onPressStart = () => {
    if (!isDisabled && !hasChildNodes) {
      onSelect(item);
    }
  }; 

  let {pressProps} = usePress(mergeProps({onPressStart}, itemProps));

  // Will need additional aria-owns and stuff when submenus are finalized
  return (
    <FocusRing
      focusRingClass={classNames(styles, 'focus-ring')}>
      <li
        {...mergeProps(pressProps, filterDOMProps(itemProps))}
        ref={ref}
        aria-disabled={isDisabled}
        role="menuitem"
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
          {hasChildNodes &&
            <ChevronRightMedium
              UNSAFE_className={classNames(styles, 'spectrum-Menu-chevron')}
              onMouseDown={e => e.stopPropagation()} />
          }
        </span>
      </li>
    </FocusRing>
  );
}

function MenuDivider() {
  return (
    <li 
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
    <li role="presentation">
      <span 
        role="heading" 
        aria-hidden="true"
        className={classNames(
          styles,
          'spectrum-Menu-sectionHeading')}>
        {item.rendered}
      </span>
    </li>
  );
}
