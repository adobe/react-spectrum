/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ClassNameOrFunction, ContextValue, useContextProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {SharedElement, SharedElementPropsBase, SharedElementRenderProps} from './SharedElementTransition';

export interface SelectionIndicatorProps extends SharedElementPropsBase {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-SelectionIndicator'
   */
  className?: ClassNameOrFunction<SharedElementRenderProps>,
  /** Whether the SelectionIndicator is visible. This is usually set automatically by the parent component. */
  isSelected?: boolean
}

export const SelectionIndicatorContext = createContext<ContextValue<SelectionIndicatorProps, HTMLDivElement>>({
  isSelected: false
});


/**
 * An animated indicator of selection state within a group of items.
 */
export const SelectionIndicator = forwardRef(function SelectionIndicator(props: SelectionIndicatorProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, SelectionIndicatorContext);
  let {isSelected, ...otherProps} = props;
  return (
    <SharedElement
      {...otherProps}
      ref={ref}
      className={props.className || 'react-aria-SelectionIndicator'}
      name="SelectionIndicator"
      isVisible={isSelected} />
  );
});
