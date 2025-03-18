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

import {DOMAttributes} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import React, {CSSProperties, JSXElementConstructor, ReactNode, useMemo, useState} from 'react';
import {useFocusWithin} from '@react-aria/interactions';

export interface VisuallyHiddenProps extends DOMAttributes {
  /** The content to visually hide. */
  children?: ReactNode,

  /**
   * The element type for the container.
   * @default 'div'
   */
  elementType?: string | JSXElementConstructor<any>,

  /** Whether the element should become visible on focus, for example skip links. */
  isFocusable?: boolean
}

const styles: CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px',
  whiteSpace: 'nowrap'
};

export interface VisuallyHiddenAria {
  visuallyHiddenProps: DOMAttributes
}

/**
 * Provides props for an element that hides its children visually
 * but keeps content visible to assistive technology.
 */
export function useVisuallyHidden(props: VisuallyHiddenProps = {}): VisuallyHiddenAria {
  let {
    style,
    isFocusable
  } = props;

  let [isFocused, setFocused] = useState(false);
  let {focusWithinProps} = useFocusWithin({
    isDisabled: !isFocusable,
    onFocusWithinChange: (val) => setFocused(val)
  });

  // If focused, don't hide the element.
  let combinedStyles = useMemo(() => {
    if (isFocused) {
      return style;
    } else if (style) {
      return {...styles, ...style};
    } else {
      return styles;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  return {
    visuallyHiddenProps: {
      ...focusWithinProps,
      style: combinedStyles
    }
  };
}

/**
 * VisuallyHidden hides its children visually, while keeping content visible
 * to screen readers.
 */
export function VisuallyHidden(props: VisuallyHiddenProps): ReactNode {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {children, elementType: Element = 'div', isFocusable, style, ...otherProps} = props;
  let {visuallyHiddenProps} = useVisuallyHidden(props);

  return (
    <Element {...mergeProps(otherProps, visuallyHiddenProps)}>
      {children}
    </Element>
  );
}
