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

import {ContextValue, createHideableComponent, useContextProps} from './utils';
import React, {createContext, ForwardedRef, LabelHTMLAttributes} from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  elementType?: string
}

export const LabelContext = createContext<ContextValue<LabelProps, HTMLLabelElement>>({});

function Label(props: LabelProps, ref: ForwardedRef<HTMLLabelElement>) {
  [props, ref] = useContextProps(props, ref, LabelContext);
  let {elementType: ElementType = 'label', ...labelProps} = props;
  // @ts-ignore
  return <ElementType className="react-aria-Label" {...labelProps} ref={ref} />;
}

const _Label = /*#__PURE__*/ createHideableComponent(Label);
export {_Label as Label};
