/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {ContextValue, DOMProps, SlotProps, useContextProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {Input} from './Input';
import {PressResponder} from '@react-aria/interactions';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';

export interface FileTriggerProps extends SlotProps, DOMProps, AriaLabelingProps {
  /**
   * Specifies what mime type of files are allowed.
   */
  acceptedFileTypes?: Array<string>,
  /**
   * Whether multiple files can be selected.
   */
  allowsMultiple?: boolean,
  /**
   * Specifies the use of a media capture mechanism to capture the media on the spot.
   */
  defaultCamera?: 'user' | 'environment',
  /**
   * Handler when a user selects a file.
   */
  onChange?: (files: FileList | null) => void
}

export const FileTriggerContext = createContext<ContextValue<FileTriggerProps, HTMLDivElement>>(null);

function FileTrigger(props: FileTriggerProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, FileTriggerContext);
  let {onChange, acceptedFileTypes, className, allowsMultiple, defaultCamera, children, ...otherProps} = props;
  let inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={className || 'react-aria-FileTrigger'}
      {...filterDOMProps(otherProps)}
      ref={ref}
      slot={props.slot}>
      <PressResponder onPress={() => inputRef.current?.click()}>
        {children}
      </PressResponder>
      <Input 
        type="file" 
        ref={inputRef}
        style={{display: 'none'}}
        accept={acceptedFileTypes?.toString()} 
        onChange={(e) => onChange?.(e.target.files)} 
        capture={defaultCamera} 
        multiple={allowsMultiple} /> 
    </div>
  );
}

/**
 * A FileTrigger allows a user to access the file system with either a Button or Link.
 */
const _FileTrigger = forwardRef(FileTrigger);
export {_FileTrigger  as FileTrigger};
