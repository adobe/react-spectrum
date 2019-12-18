import {classNames} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {MenuContext} from './context';
import {mergeProps} from '@react-aria/utils';
import React, {ReactElement, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

interface MenuProps extends DOMProps{
  children?: ReactElement[]
}

// This is a filler Menu component, used to illustrate how the MenuContext might be consumed. 
// It will get replaced by the real Menu component when it gets written

export function Menu(props: MenuProps) {
  let contextProps = useContext(MenuContext) || {};
  let {
    id,
    'aria-labelledby': labelledBy,
    children
  } = mergeProps(contextProps, props);

  let menuProps = {
    id,
    role: 'menu',
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
