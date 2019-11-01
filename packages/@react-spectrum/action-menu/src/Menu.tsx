import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {ReactNode, RefObject, useContext, useRef} from 'react';
import {Popover} from '@react-spectrum/overlays';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

export const Menu = React.forwardRef((props, ref) => {
  let {
    placement,
    arrowProps,
    onSelect,
    id,
    role,
    'aria-labelledby': labelledBy,
    hideArrow,
    style,
    isOpen,
    children
  } = props;

  let popoverProps = {
    placement,
    arrowProps,
    hideArrow,
    style,
    isOpen
  }

  let menuProps = {
    id,
    role,
    'aria-labelledby': labelledBy
  }


  children = React.Children.map(children, (c) => 
    React.cloneElement(c, {
      onClick: onSelect,
      className: classNames(
        styles,
        'spectrum-Menu-item'
      )
    })
  )
  return (
    <Popover {...popoverProps} ref={ref}>
      <ul 
        {...menuProps}
        className={classNames(
          styles,
          'spectrum-Menu')}>
        {children}
      </ul>
    </Popover>
  )
})
