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

import {AriaLabelingProps} from '@react-types/shared';
import {ButtonContext} from './Button';
import {ContextValue, DOMProps, Provider, SlotProps, useContextProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {Input} from './Input';
import {LinkContext} from './Link';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';

export interface FileTriggerProps extends SlotProps, DOMProps, AriaLabelingProps {
  // want to be able to pass down accept types to the input 
  accept?: string,
  // onChange event for the input 
  handleChange?: React.ChangeEventHandler<HTMLInputElement>
}

export const FileTriggerContext = createContext<ContextValue<FileTriggerProps, HTMLDivElement>>(null);

function FileTrigger(props: FileTriggerProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, FileTriggerContext);
  let {handleChange, accept, className, ...otherProps} = props;
  let inputRef = useRef<HTMLInputElement>(null);

  return (
    <Provider
      values={[
        [LinkContext, {slot: 'file', onPress: () => inputRef.current?.click()}],  
        [ButtonContext, {slot: 'file', onPress: () => inputRef.current?.click()}]
      ]}>
      <div
        className={className || 'react-aria-FileTrigger'}
        {...filterDOMProps(otherProps)}
        ref={ref}
        slot={props.slot}>
        <Input type="file" style={{display: 'none'}} ref={inputRef} accept={accept} onChange={handleChange} /> 
        {props.children}
      </div>
    </Provider>
  );
}

/**
 * A FileTrigger allows a user to access the file system with either a Button or Link.
 */
const _FileTrigger = forwardRef(FileTrigger);
export {_FileTrigger  as FileTrigger};
