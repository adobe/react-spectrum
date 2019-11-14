import {classNames} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {MenuContext} from './context';
import {mergeProps} from '@react-aria/utils';
import React, {ReactElement, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';


import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {Popover} from '@react-spectrum/overlays';
import {FocusRing, FocusScope} from '@react-aria/focus';

interface MenuProps extends DOMProps{
  children?: ReactElement[]
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
  // grab context from MenuTrigger its got things like id, aria stuff etc, spread it on the top

  // Is Menu going to be an internal component? If not, do I need to move Popover back into here and adjust the MenuTrigger context obj to contain the popover props as well
  
  // Ask about SelectionGroup stuff that is in the Dropbox, is that gonna be something here?
  // If it is gona be a thing, probably add it to CollectionBuilder and figure out what it will look like
  // I figure it is needed so that we can properly contain arrow up/down focus containment within a Menu section (see spectrum-css)

  // Figure out how to propagate the onSelect event (prop just placed on the top level menu and passed to useTreeState)

  // Figure out how to get the Focus working
  // Add a FocusRing wrapping the whole Menu and put a FocusScope around it as well?
  // FocusScope might go around each Heading/Section instead
  // see if that gives me the ability to use arrow keys to shift focus, otherwise look at v2 dropdown to see
  // Actually I'm pretty sure this is handled in devon's selection and focus management pull

  // Planning for what the stuff will look like
  // if (type === 'section'), then return a Heading with trailing divider
  // else just return the MenuItem
  
  return (
    // <Popover isOpen hideArrow> 
      <ul
        role="menu"
        className={classNames(
          styles,
          'spectrum-Menu')}>
        {props.children}
      </ul>
    // </Popover>
  )

}

interface MenuItemProps extends DOMProps {
  children?: ReactElement[];
}

// For now export just to see what it looks like, remove after
// Placeholder for now, Rob's pull will make the real menuItem
export function MenuItem(props: MenuItemProps) {
  
  return (
    <FocusRing 
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
      <li
        role="menuitem"
        tabindex="0"
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
export function MenuDivider(props: MenuDividerProps) {
  return (
    <li 
      className={classNames(
        styles,
        'spectrum-Menu-divider'
      )}
      role="separator" />
  )
}

interface MenuHeadingProps {
  children?: ReactElement[];
}

// For now export just to see what it looks like, remove after
export function MenuHeading(props: MenuHeadingProps) {
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
