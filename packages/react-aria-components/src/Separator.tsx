/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {SeparatorProps as AriaSeparatorProps, useSeparator} from 'react-aria';
import {ContextValue, SlotProps, StyleProps, useContextProps} from './utils';
import {createLeafComponent} from '@react-aria/collections';
import {filterDOMProps} from '@react-aria/utils';
import React, {createContext, ElementType, ForwardedRef} from 'react';

export interface SeparatorProps extends AriaSeparatorProps, StyleProps, SlotProps {}

export const SeparatorContext = createContext<ContextValue<SeparatorProps, HTMLElement>>({});

export const Separator = /*#__PURE__*/ createLeafComponent('separator', function Separator(props: SeparatorProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, SeparatorContext);

  let {elementType, orientation, style, className} = props;
  let Element = (elementType as ElementType) || 'hr';
  if (Element === 'hr' && orientation === 'vertical') {
    Element = 'div';
  }

  let {separatorProps} = useSeparator({
    elementType,
    orientation
  });

  return (
    <Element
      {...filterDOMProps(props)}
      {...separatorProps}
      style={style}
      className={className ?? 'react-aria-Separator'}
      ref={ref}
      slot={props.slot || undefined} />
  );
});
