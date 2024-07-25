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

import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {Input} from './Input';
import {PressResponder} from '@react-aria/interactions';
import React, {ForwardedRef, forwardRef, ReactNode} from 'react';

export interface FileTriggerProps {
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
  onSelect?: (files: FileList | null) => void,
  /**
   * The children of the component.
   */
  children?: ReactNode,
  /**
   * Enables the selection of directories instead of individual files.
   */
  acceptDirectory?: boolean
}

function FileTrigger(props: FileTriggerProps, ref: ForwardedRef<HTMLInputElement>) {
  let {onSelect, acceptedFileTypes, allowsMultiple, defaultCamera, children, acceptDirectory, ...rest} = props;
  let inputRef = useObjectRef(ref);
  let domProps = filterDOMProps(rest);

  return (
    <>
      <PressResponder
        onPress={() => {
          if (inputRef.current?.value) {
            inputRef.current.value = '';
          }
          inputRef.current?.click();
        }}>
        {children}
      </PressResponder>
      <Input
        {...domProps}
        type="file"
        ref={inputRef}
        style={{display: 'none'}}
        accept={acceptedFileTypes?.toString()}
        onChange={(e) => onSelect?.(e.target.files)}
        capture={defaultCamera}
        multiple={allowsMultiple}
        // @ts-expect-error
        webkitdirectory={acceptDirectory ? '' : undefined} />
    </>
  );
}

/**
 * A FileTrigger allows a user to access the file system with any pressable React Aria or React Spectrum component, or custom components built with usePress.
 */
const _FileTrigger = forwardRef(FileTrigger);
export {_FileTrigger  as FileTrigger};
