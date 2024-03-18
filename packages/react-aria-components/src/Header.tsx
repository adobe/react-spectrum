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
import {useShallowRender} from './Collection';

export const HeaderContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLElement>>({});

function Header(originalProps: HTMLAttributes<HTMLElement>, originalRef: ForwardedRef<HTMLElement>) {
  let [props, ref] = useContextProps(originalProps, originalRef, HeaderContext);
  let shallow = useShallowRender('header', originalProps, originalRef);
  if (shallow) {
    return shallow;
  }

  return (
    <header className="react-aria-Header" {...props} ref={ref}>
      {props.children}
    </header>
  );
}

const _Header = forwardRef(Header);
export {_Header as Header};
