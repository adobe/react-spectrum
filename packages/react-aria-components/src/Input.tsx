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
import React, {createContext, ForwardedRef, forwardRef, InputHTMLAttributes} from 'react';

export const InputContext = createContext<ContextValue<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>({});

function Input(props: InputHTMLAttributes<HTMLInputElement>, ref: ForwardedRef<HTMLInputElement>) {
  [props, ref] = useContextProps(props, ref, InputContext);
  return <input {...props} ref={ref} className={props.className ?? 'react-aria-Input'} />;
}

const _Input = forwardRef(Input);
export {_Input as Input};
