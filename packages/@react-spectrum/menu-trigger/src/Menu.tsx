import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, Expandable, MultipleSelection, SelectionMode} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {Item, ListLayout, Node, Section} from '@react-stately/collections';
import {MenuContext} from './context';
import {MenuTrigger} from './';
import {mergeProps} from '@react-aria/utils';

import React, {Fragment, useContext, useEffect, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {TreeState, useTreeState} from '@react-stately/tree';
import {useMenu} from '@react-aria/menu-trigger';
import {Grid, Heading, Flex, Text, SlotContext} from "../../layout/src";
import {Divider} from "@react-spectrum/divider";
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

export {Item, Section};

interface MenuProps<T> extends CollectionBase<T>, Expandable, MultipleSelection, DOMProps {
  onSelect?: (...args) => void,
  autoFocus?: boolean, // whether or not to autoFocus on Menu opening
  focusStrategy?: 'first' | 'last' // whether or not to focus the first or last item
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
    selectionMode: 'single' as SelectionMode
  };
  let state = useTreeState(completeProps);

  let {menuProps} = useMenu(completeProps, state, layout);

  let {
    onSelect,
    ...otherProps
  } = completeProps;

  useEffect(() => {
    let selectionManager = state.selectionManager;
    if (completeProps.focusStrategy) {
      state.selectionManager.setFocused(true);
      if (completeProps.focusStrategy === 'first') {
        selectionManager.setFocusedKey(layout.getFirstKey());
      } else if (completeProps.focusStrategy === 'last') {
        selectionManager.setFocusedKey(layout.getLastKey());
      } else {
        let selectedKeys = selectionManager.selectedKeys;
        if (selectedKeys.size) {
          selectionManager.setFocusedKey(selectedKeys.values().next().value);
        }
      }
      completeProps.setFocusStrategy(null);
    }
  }, []);

  // Remove FocusScope? Need to figure out how to focus the first or last item depending on ArrowUp/Down event in MenuTrigger
  return (
    <CollectionView
      {...filterDOMProps(otherProps)}
      {...menuProps}
      focusedKey={state.selectionManager.focusedKey}
      className={classNames(styles, 'spectrum-Menu')}
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
              {/*
                // @ts-ignore */}
              <Menu items={item.childNodes} onSelect={onSelect}>
                {
                  // @ts-ignore
                  child =>  <Item>{child.rendered}</Item>
                }
              </Menu>
            </MenuTrigger>
          );
        } else {
          return (
            <MenuItem
              item={item}
              state={state}
              onSelect={onSelect} />
          )
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
    hasChildNodes,
    value
  } = item;

  let ref = useRef<HTMLLIElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: item.key,
    itemRef: ref
  });

  // Prob should be in a useMenuItem aria hook
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
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
      <li
        {...mergeProps(pressProps, filterDOMProps(itemProps))}
        ref={ref}
        aria-disabled={isDisabled}
        role="menuitem"
        tabIndex={isDisabled ? null : 0}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-disabled': isDisabled,
            'is-selected': isSelected
          }
        )}>
        <Grid
          className={classNames(styles, 'spectrum-Menu-itemGrid')}
          slots={{
            label: styles['spectrum-Menu-itemLabel'],
            tools: styles['spectrum-Menu-tools'],
            icon: styles['spectrum-Menu-icon'],
            detail: styles['spectrum-Menu-detail']
          }}>
          {!Array.isArray(rendered) && (
            <Text>
              {rendered}
            </Text>
          )}
          {Array.isArray(rendered) && rendered}
          {hasChildNodes &&
            <ChevronRightMedium
              slot="tools"
              className={classNames(styles, 'spectrum-Menu-chevron')}
              onMouseDown={e => e.stopPropagation()} />
          }
        </Grid>
      </li>
    </FocusRing>
  );

  // Need to figure out the alternative to using Pressable below, it breaks some stuff
  // like the useEffect in useSelectableItem. Prob will need a separate trigger from MenuTrigger maybe?
  // Maybe need to modify MenuTrigger itself so it works with non RSP Button elements
  // Also has an issue where the focus ring stuff doesn't appear on menu items with child nodes,
  // maybe a ref issue?
}

function MenuDivider() {
  return (
    <li>
      <Divider size="S" />
    </li>
  );
}

interface MenuHeadingProps<T> {
  item: Node<T>
}

function MenuHeading<T>({item}: MenuHeadingProps<T>) {
  return (
    <li role="presentation">
      <SlotContext.Provider value={{heading: styles['spectrum-Menu-sectionHeading']}}>
        <Heading>
          {item.rendered}
        </Heading>
      </SlotContext.Provider>
    </li>
  );
}
