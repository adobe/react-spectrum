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

export const KeyboardContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLElement>>({});

function Keyboard(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, KeyboardContext);
  return <kbd dir="ltr" {...props} ref={ref} />;
}

const _Keyboard = forwardRef(Keyboard);
export {_Keyboard as Keyboard};
