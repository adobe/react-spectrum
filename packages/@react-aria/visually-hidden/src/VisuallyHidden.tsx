/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import classNames from 'classnames';
import React, {HTMLAttributes, JSXElementConstructor, ReactNode} from 'react';
import styles from './VisuallyHidden.css';

interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  /** The content to visually hide */
  children: ReactNode,

  /**
   * The element type for the container 
   * @default 'div'
   */
  elementType?: string | JSXElementConstructor<any>,
  
  /** Whether the content can be focused */
  isFocusable?: boolean
}

/**
 * VisuallyHidden hides its children visually, while keeping content visible
 * to screen readers.
 */
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
