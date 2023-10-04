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
import {filterDOMProps} from '@react-aria/utils';
import React, {createContext, ElementType, ForwardedRef, forwardRef} from 'react';
import {useShallowRender} from './Collection';

export interface SeparatorProps extends AriaSeparatorProps, StyleProps, SlotProps {}

export const SeparatorContext = createContext<ContextValue<SeparatorProps, HTMLElement>>({});

function Separator(originalProps: SeparatorProps, originalRef: ForwardedRef<HTMLElement>) {
  let [props, ref] = useContextProps(originalProps, originalRef, SeparatorContext);
  let {elementType, orientation, style, className} = props;
  let Element = (elementType as ElementType) || 'hr';
  if (Element === 'hr' && orientation === 'vertical') {
    Element = 'div';
  }

  let {separatorProps} = useSeparator({
    elementType,
    orientation
  });

  let shallow = useShallowRender('separator', originalProps, originalRef);
  if (shallow) {
    return shallow;
  }

  return (
    <Element
      {...filterDOMProps(props)}
      {...separatorProps}
      style={style}
      className={className ?? 'react-aria-Separator'}
      ref={ref}
      slot={props.slot || undefined} />
  );
}

const _Separator = forwardRef(Separator);
export {_Separator as Separator};
