import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {MenuContext} from './context';
import {Node} from '@react-stately/collections';
import React, {AllHTMLAttributes, useContext, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {TreeState} from '@react-stately/tree'; 
import {useMenuItem} from '@react-aria/menu-trigger';

interface MenuItemProps<T> extends AllHTMLAttributes<HTMLElement> {
  item: Node<T>,
  state: TreeState<T>
}

export function MenuItem<T>(props: MenuItemProps<T>) {
  let {
    item,
    state,
    ...otherProps
  } = props;

  let menuProps = useContext(MenuContext) || {};
  let {
    rendered,
    isSelected,
    isDisabled
  } = item;

  let ref = useRef<HTMLDivElement>();
  let {menuItemProps} = useMenuItem(
    {
      item,
      ...otherProps
    }, 
    ref, 
    state,
    menuProps.setOpen
  );

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...filterDOMProps(otherProps)}
        {...menuItemProps}
        ref={ref}
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
