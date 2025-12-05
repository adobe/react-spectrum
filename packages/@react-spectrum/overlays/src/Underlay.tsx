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
import {applyContainerBounds, useUNSAFE_PortalContext} from '@react-aria/overlays';
import {classNames} from '@react-spectrum/utils';
import {isScrollable} from '@react-aria/utils';
import React, {JSX} from 'react';
import underlayStyles from '@adobe/spectrum-css-temp/components/underlay/vars.css';

interface UnderlayProps {
  isOpen?: boolean,
  isTransparent?: boolean
}

export function Underlay({isOpen, isTransparent, ...otherProps}: UnderlayProps): JSX.Element {
  let {getContainerBounds} = useUNSAFE_PortalContext();
  let containerBounds = getContainerBounds?.();
  
  let pageHeight: number | undefined = undefined;
  if (typeof document !== 'undefined') {
    let scrollingElement = isScrollable(document.body) ? document.body : document.scrollingElement || document.documentElement;
    // Prevent Firefox from adding scrollbars when the page has a fractional height.
    let fractionalHeightDifference = scrollingElement.getBoundingClientRect().height % 1;
    pageHeight = scrollingElement.scrollHeight - fractionalHeightDifference;
    
    // If container bounds are provided, use those height instead
    if (containerBounds) {
      pageHeight = containerBounds.height;
    }
  }

  let style: React.CSSProperties = {height: pageHeight};
  
  // If container bounds are provided, position the underlay relative to the container
  applyContainerBounds(style, containerBounds);

  return (
    <div
      data-testid="underlay"
      {...otherProps}
      // Cover the entire document so iOS 26 Safari doesn't clip the underlay to the inner viewport.
      // If container bounds are provided, constrain to those bounds instead.
      style={style}
      className={classNames(underlayStyles, 'spectrum-Underlay', {
        'is-open': isOpen,
        'spectrum-Underlay--transparent': isTransparent
      })} />
  );
}
