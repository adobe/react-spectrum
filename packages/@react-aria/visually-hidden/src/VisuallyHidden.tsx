import classNames from 'classnames';
import {DOMProps} from '@react-types/shared';
import React, {JSXElementConstructor, ReactNode} from 'react';
import styles from './VisuallyHidden.css';

interface VisuallyHiddenProps extends DOMProps {
  children: ReactNode,
  elementType?: string | JSXElementConstructor<any>,
  isFocusable?: boolean
}

export function VisuallyHidden(props: VisuallyHiddenProps) {
  let {
    children,
    className,
    elementType: Element = 'div',
    isFocusable,
    ...otherProps
  } = props;
  
  className = classNames(
    styles['u-react-spectrum-screenReaderOnly'],
    {[styles['is-focusable']]: isFocusable},
    className
  );
    
  return (
    <Element
      className={className}
      {...otherProps}>
      {children}
    </Element>
  );
}
