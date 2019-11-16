import {classNames} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {MenuContext} from './context';
import {mergeProps} from '@react-aria/utils';
import React, {Fragment, ReactElement, useContext, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';


import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {FocusRing, FocusScope} from '@react-aria/focus';
import {useTreeState} from '@react-stately/tree';
import {Item, ListLayout, Section} from '@react-stately/collections';
import {CollectionView} from '@react-aria/collections';
import {useMenu} from '@react-aria/menu-trigger';

// Testing submenus
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {MenuTrigger} from './';
import {Pressable} from '@react-aria/interactions';

export {Item, Section};

interface MenuProps extends DOMProps{
  children?: ReactElement | ReactElement[]
}

// This is a filler Menu component, used to illustrate how the MenuContext might be consumed. 
// It will get replaced by the real Menu component when it gets written

export function Menu(props: MenuProps) {
  let contextProps = useContext(MenuContext) || {};
  let {
    id,
    role,
    'aria-labelledby': labelledBy,
    children
  } = mergeProps(contextProps, props);

  let menuProps = {
    id,
    role,
    'aria-labelledby': labelledBy
  };

  children = React.Children.map(children, (c) => 
    React.cloneElement(c, {
      className: classNames(
        styles,
        'spectrum-Menu-item'
      )
    })
  );

  return (
    <ul
      {...menuProps}
      className={classNames(
        styles,
        'spectrum-Menu')}>
      {children}
    </ul>
  );
}


// For now, export a v3 version of Menu just so I can gradually replace the mock Menu component above
export function V3Menu<T>(props: CollectionBase<T> & Expandable & MultipleSelection & DOMProps) {
  // Given the typing of the Menu interface, are users meant to be able to pass in other dom props? Probably yeah?
  // Yes, adjust the above interface

  // Figure out how to propagate the onSelect event (prop just placed on the top level menu and passed to useTreeState)

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
      {(type, item) => {
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

interface MenuItemProps extends DOMProps {

}

// For now export just to see what it looks like, remove after
// Placeholder for now, Rob's pull will make the real menuItem
// How would we get MenuItem user specified props in?
export function MenuItem({item, onSelectToggle, onToggle}) {
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
        <V3Menu items={value.children} itemKey="name">
          {item => <Item childItems={item.children}>{item.name}</Item>}
        </V3Menu>
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

export function V2MenuItem(props) {
  return (
    <FocusRing 
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
      <li
        role="menuitem"
        tabIndex="0"
        className={classNames(
          styles,
          'spectrum-Menu-item')}>
        <span
          className={classNames(
            styles,
            'spectrum-Menu-itemLabel')}>
          {props.children}
        </span>
      </li>
   </FocusRing>
  )
}

interface MenuDividerProps {

}

// For now export just to see what it looks like, remove after
export function MenuDivider() {
  // Will need logic to change aria-orientation (if we support horizonal menus)
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

// For now export just to see what it looks like, remove after
export function V2MenuDivider() {
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

interface MenuHeadingProps {
  children?: ReactElement | ReactElement[];
}

// For now export just to see what it looks like, remove after
export function MenuHeading({item}) {
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

export function V2MenuHeading(props) {
  return (
    <li role="presentation">
      <span 
        role="heading" 
        aria-hidden="true"
        className={classNames(
          styles,
          'spectrum-Menu-sectionHeading')}>
        {props.children}
      </span>
    </li>
  )
}
