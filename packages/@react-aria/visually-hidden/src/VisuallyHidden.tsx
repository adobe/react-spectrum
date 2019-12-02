import classNames from 'classnames';
import React, {HTMLAttributes, JSXElementConstructor, ReactNode} from 'react';
import styles from './VisuallyHidden.css';

interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
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
