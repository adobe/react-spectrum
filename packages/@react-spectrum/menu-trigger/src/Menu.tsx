import {classNames} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {MenuContext} from './context';
import {mergeProps} from '@react-aria/utils';
import React, {Fragment, ReactElement, useContext, useMemo} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';


import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {Popover} from '@react-spectrum/overlays';
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
export function V3Menu<T>(props: CollectionBase<T> & Expandable & MultipleSelection) {
  // Do we want it to look like v2 Menu or spectrum-css example? v2 Menu has the sectionHeading class on the <li>
  // whereas spectrum-css has it on the <span>
  
  // Given the typing of the Menu interface, are users meant to be able to pass in other dom props? Probably yeah?

  
  // grab context from MenuTrigger its got things like id, aria stuff etc, spread it on the top

  // Is Menu going to be an internal component? If not, do I need to move Popover back into here and adjust the MenuTrigger context obj to contain the popover props as well
  // Think about how submenu will need to render
  
  // Ask about SelectionGroup stuff that is in the Dropbox, is that gonna be something here?
  // If it is gona be a thing, probably add it to CollectionBuilder and figure out what it will look like
  // I figure it is needed so that we can properly contain arrow up/down focus containment within a Menu section (see spectrum-css)

  // Figure out how to propagate the onSelect event (prop just placed on the top level menu and passed to useTreeState)

  // Figure out how to get the Focus working
  // Where to put Focus scope? FocusRing can go around the MenuItem
  // see if that gives me the ability to use arrow keys to shift focus, otherwise look at v2 dropdown to see
  // Actually I'm pretty sure this is handled in devon's selection and focus management pull

  // Will we be supporting horizontal orientation of menu?

  let contextProps = useContext(MenuContext) || {};
  let completeProps = mergeProps(contextProps, props);

  let {
    tree,
    onSelectToggle
  } = useTreeState(completeProps);

  let {menuProps} = useMenu(completeProps); 

  let layout = useMemo(() => 
    new ListLayout({
      rowHeight: 32 // This makes the heading wrapping div 32, but the heading should only take up 20
    })
  , []);

  return (
    <Popover isOpen hideArrow> 
      <FocusScope autoFocus>
        <CollectionView
          {...menuProps}
          className={classNames(styles, 'spectrum-Menu')} // I had to add a static height and width to menu css to use this style, doesn't seem right. This is because the wrapping divs do some kind of calc and hard set a width
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
            // console.log('item', item);
            return (
              <MenuItem 
                item={item}
                onSelectToggle={() => onSelectToggle(item)} />
            );
          }}
        </CollectionView>
      </FocusScope>
    </Popover>
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
    hasChildNodes,
    value
  } = item;
  // console.log('item in menuItem', item);
  // Missing checkmark selection icon at the moment, I'll put it in later
  // Missing aria-disabled, need something to tell me that it is disabled first
  // Will need additional aria-owns and stuff when submenus are finalized
  let renderedItem = (
    <li
      role="menuitem"
      tabIndex="0" // will probably need disabled logic
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectToggle(item);
      }} // Looks like if you click too fast it stops being responsive and falls out of sync
      // Will also need to adjust MenuTrigger so that onPress doesn't fire if preventDefault is called?
      className={classNames(
        styles,
        'spectrum-Menu-item',
        {
          'is-disabled': false, // no disabled info attached to item? Should I add it in useTreeState?
          'is-selected': isSelected
        }
      )}>
      <span
        className={classNames(
          styles,
          'spectrum-Menu-itemLabel')}>
        {hasChildNodes &&
          <ChevronRightMedium
            className={classNames(styles, 'spectrum-TreeView-indicator')}
            onMouseDown={e => e.stopPropagation()}
            onClick={onToggle}
            size={null} />
        }
        {rendered}
      </span>
    </li>
  );
  
  if (hasChildNodes) {
    renderedItem = (
      <MenuTrigger>
        <Pressable>
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
