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
import {createLeafComponent, HeaderNode} from '@react-aria/collections';
import React, {createContext, ForwardedRef, HTMLAttributes} from 'react';

export interface HeaderProps extends HTMLAttributes<HTMLElement>, DOMRenderProps<'header', undefined> {}

export const HeaderContext = createContext<ContextValue<HeaderProps, HTMLElement>>({});

export const Header = /*#__PURE__*/ createLeafComponent(HeaderNode, function Header(props: HeaderProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, HeaderContext);
  return (
    <dom.header className="react-aria-Header" {...props} ref={ref}>
      {props.children}
    </dom.header>
  );
});
