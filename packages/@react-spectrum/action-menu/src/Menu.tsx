import {classNames} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {MenuContext} from './context';
import {mergeProps} from '@react-aria/utils';
import React, {ReactElement, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

interface MenuProps extends DOMProps{
  onSelect?: (...args) => void,
  children?: ReactElement[]
}

export function Menu(props: MenuProps) {
  let contextProps = useContext(MenuContext) || {};
  let {
    onSelect,
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
      onClick: onSelect,
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
};
