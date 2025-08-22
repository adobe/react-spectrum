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
import {BaseCollection, CollectionNode, createLeafComponent} from '@react-aria/collections';
import {ContextValue, SlotProps, StyleProps, useContextProps} from './utils';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {GlobalDOMAttributes} from '@react-types/shared';
import React, {createContext, ElementType, ForwardedRef} from 'react';

export interface SeparatorProps extends AriaSeparatorProps, StyleProps, SlotProps, GlobalDOMAttributes<HTMLElement> {}

export const SeparatorContext = createContext<ContextValue<SeparatorProps, HTMLElement>>({});

export class SeparatorNode extends CollectionNode<any> {
  static readonly type = 'separator';

  filter(collection: BaseCollection<any>, newCollection: BaseCollection<any>): CollectionNode<any> | null {
    let prevItem = newCollection.getItem(this.prevKey!);
    if (prevItem && prevItem.type !== 'separator') {
      let clone = this.clone();
      newCollection.addDescendants(clone, collection);
      return clone;
    }

    return null;
  }
}

export const Separator = /*#__PURE__*/ createLeafComponent(SeparatorNode, function Separator(props: SeparatorProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, SeparatorContext);

  let {elementType, orientation, style, className, slot, ...otherProps} = props;
  let Element = (elementType as ElementType) || 'hr';
  if (Element === 'hr' && orientation === 'vertical') {
    Element = 'div';
  }

  let {separatorProps} = useSeparator({
    ...otherProps,
    elementType,
    orientation
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <Element
      {...mergeProps(DOMProps, separatorProps)}
      style={style}
      className={className ?? 'react-aria-Separator'}
      ref={ref}
      slot={slot || undefined} />
  );
});
