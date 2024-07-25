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

import {ContextValue, useContextProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  elementType?: string
}

export const TextContext = createContext<ContextValue<TextProps, HTMLElement>>({});

function Text(props: TextProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, TextContext);
  let {elementType: ElementType = 'span', ...domProps} = props;
  // @ts-ignore
  return <ElementType className="react-aria-Text" {...domProps} ref={ref} />;
}

const _Text = forwardRef(Text);
export {_Text as Text};
