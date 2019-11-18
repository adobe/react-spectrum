import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames} from '@react-spectrum/utils';
import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {DOMProps} from '@react-types/shared';
import {Item, ListLayout, Node, Section} from '@react-stately/collections';
import {FocusRing} from '@react-aria/focus';
import {MenuContext} from './context';
import {MenuTrigger} from './';
import {mergeProps} from '@react-aria/utils';
import {Pressable} from '@react-aria/interactions';
import React, {Fragment, useContext, useMemo} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenu} from '@react-aria/menu-trigger';
import {useTreeState} from '@react-stately/tree';

export {Item, Section};

interface MenuProps<T> extends CollectionBase<T>, Expandable, MultipleSelection, DOMProps {};

export function Menu<T>(props: MenuProps<T>) {
  // Figure out how to propagate the onSelect event (prop just placed on the top level menu and passed to useTreeState?)

  // Figure out how to get the Focus working
  // Where to put Focus scope? FocusRing can go around the MenuItem
  // see if that gives me the ability to use arrow keys to shift focus, otherwise look at v2 dropdown to see
  // Actually I'm pretty sure this is handled in devon's selection and focus management pull

  let contextProps = useContext(MenuContext) || {};
  let completeProps = mergeProps(contextProps, props);

  let {
    tree,
    onSelectToggle,
    onToggle
  } = useTreeState(completeProps);

  let {menuProps} = useMenu(completeProps); 

  let layout = useMemo(() => 
    new ListLayout({
      rowHeight: 32, // Feel like we should eventually calculate this number (based on the css)? It should probably get a multiplier in order to gracefully handle scaling
      headingHeight: 26 // Same as above
    })
  , []);

  // Remove FocusScope? Need to figure out how to focus the first or last item depending on ArrowUp/Down event in MenuTrigger
  return (
    <CollectionView
      {...menuProps}
      className={classNames(styles, 'spectrum-Menu')}
      layout={layout}
      collection={tree}>
      {(type, item: Node<T>) => {
        if (type === 'section') {
          return (
            <Fragment>
              <MenuHeading item={item} />
              <MenuDivider />
            </Fragment>
          )
        }

        return (
          <MenuItem 
            item={item}
            onToggle={() => onToggle(item)} 
            onSelectToggle={() => onSelectToggle(item)} />
        );
      }}
    </CollectionView>
  );
}

interface MenuItemProps<T> {
  item: Node<T>,
  onToggle: (item: Node<T>) => void,
  onSelectToggle: (item: Node<T>) => void
}

// For now export just to see what it looks like, remove after
// Placeholder for now, Rob's pull will make the real menuItem
// How would we get MenuItem user specified props in?
function MenuItem<T>({item, onSelectToggle, onToggle}: MenuItemProps<T>) {
  let {
    rendered,
    isSelected,
    isDisabled,
    hasChildNodes,
    value
  } = item;

  // Will need additional aria-owns and stuff when submenus are finalized
  let renderedItem = (
    <li
      aria-disabled={isDisabled}
      role="menuitem"
      tabIndex={isDisabled ? null : 0}
      onMouseDown={() => {
        if (!isDisabled) {
          onSelectToggle(item);
        }
      }}
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
            className={classNames(styles, 'spectrum-Menu-chevron')}
            onMouseDown={e => e.stopPropagation()}
            onClick={onToggle}
            size={null} />
        }
      </span>
    </li>
  );

  if (hasChildNodes) {
    renderedItem = (
      <MenuTrigger>
        <Pressable isDisabled={isDisabled}>
          {renderedItem}
        </Pressable>
         {/*
            // @ts-ignore */}
        <Menu items={value.children} itemKey="name">
          {
            item => {
              // @ts-ignore
              return (<Item childItems={item.children}>{item.name}</Item>)
            }
          } 
        </Menu>
      </MenuTrigger>
    )
  }

  return (
    <FocusRing 
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
     {renderedItem}
   </FocusRing>
  )
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
  )
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
  )
}
