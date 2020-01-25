import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import {MenuContext} from './context';
import {Node} from '@react-stately/collections';
import React, {AllHTMLAttributes, useContext, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '@react-spectrum/typography';
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
        <Grid
          UNSAFE_className={classNames(styles, 'spectrum-Menu-itemGrid')}
          slots={{
            label: styles['spectrum-Menu-itemLabel'],
            tools: styles['spectrum-Menu-tools'],
            icon: styles['spectrum-Menu-icon'],
            detail: styles['spectrum-Menu-detail']}}>
          {!Array.isArray(rendered) && (
            <Text slot="label">
              {rendered}
            </Text>
          )}
          {Array.isArray(rendered) && rendered}
          {isSelected && <CheckmarkMedium slot="end" UNSAFE_className={classNames(styles, 'spectrum-Menu-checkmark')} />}
        </Grid>  
      </div>
    </FocusRing>
  );
}
