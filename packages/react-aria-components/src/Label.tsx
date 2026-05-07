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

import {ContextValue, dom, DOMRenderProps, useContextProps} from './utils';
import {createHideableComponent} from 'react-aria/private/collections/Hidden';
import {HoverEvents} from '@react-types/shared';
import {mergeProps} from 'react-aria/mergeProps';
import React, {createContext, ForwardedRef, LabelHTMLAttributes} from 'react';
import {useHover} from 'react-aria/useHover';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement>, HoverEvents, DOMRenderProps<'label', undefined> {
  elementType?: string
}

export const LabelContext = createContext<ContextValue<LabelProps, HTMLLabelElement>>({});

let filterHoverProps = (props: LabelProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {onHoverStart, onHoverChange, onHoverEnd, ...otherProps} = props;
  return otherProps;
};

export const Label = /*#__PURE__*/ createHideableComponent(function Label(props: LabelProps, ref: ForwardedRef<HTMLLabelElement>) {
  [props, ref] = useContextProps(props, ref, LabelContext);
  let {elementType = 'label', ...labelProps} = props;
  let {hoverProps} = useHover(props);
  let ElementType = dom[elementType];
  // @ts-ignore
  return <ElementType className="react-aria-Label" {...mergeProps(filterHoverProps(labelProps), hoverProps)} ref={ref} />;
});
