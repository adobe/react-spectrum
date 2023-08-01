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

import {AriaLabelingProps, DOMProps, FocusableRefValue, StyleProps} from '@react-types/shared';
import {classNames, createFocusableRef, SlotProvider, useStyleProps} from '@react-spectrum/utils';
import {DropZoneProps, FileTriggerContext, Provider, DropZone as RACDropZone} from 'react-aria-components';
import {mergeProps} from '@react-aria/utils';
import React, {ReactNode, Ref, useImperativeHandle, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/dropzone/vars.css';
export interface SpectrumDropZoneProps extends DropZoneProps, DOMProps, StyleProps, AriaLabelingProps {
  /** The content to display in the button. */
  children: ReactNode,
  /** Whether the dropzone has been filled. */
  isFilled?: boolean, 
  /** The message to replace the default banner message that is shown when the dropzone is filled. */
  replaceMessage?: string
}

export interface DropZoneRef extends FocusableRefValue<HTMLInputElement, HTMLDivElement> {
  getInputElement(): HTMLInputElement | HTMLDivElement | null
}

function DropZone(props: SpectrumDropZoneProps, ref: Ref<DropZoneRef>) {
  let {children, isFilled, replaceMessage, ...otherProps} = props;
  let {styleProps} = useStyleProps(props);
  let domRef = useRef<HTMLDivElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  // Expose imperative interface for ref
  useImperativeHandle(ref, () => ({
    ...createFocusableRef(domRef, inputRef),
    getInputElement() {
      return inputRef.current;
    }
  }));

  return (
    <Provider
      values={[
        [FileTriggerContext, {inputRef: inputRef}]
      ]}>
      <RACDropZone
        {...mergeProps(otherProps)}
        {...styleProps as Omit<React.HTMLAttributes<HTMLElement>, 'onDrop'>}
        className={
        classNames(
          styles,
          'spectrum-Dropzone',
          {
            'is-filled': isFilled
          },
          styleProps.className
        )} 
        ref={domRef}>
        {({isFocused, isFocusVisible, isDropTarget}) => (
          <>
            {isFilled && isDropTarget && 
              <div
                className={
                  classNames(
                    styles,
                    'spectrum-Dropzone--banner',
                    styleProps.className
                  )
                }>
                {replaceMessage ? replaceMessage : 'Drop file to replace'}
              </div>}
            <SlotProvider
              slots={{
                illustration: {UNSAFE_className: classNames(
                  styles, 
                  'spectrum-Dropzone--illustratedMessage', 
                  {
                    'is-drop-target': isDropTarget,
                    'is-focused': isFocused,
                    'is-focus-visible': isFocusVisible
                  }
                  )}
              }}> 
              {children}
            </SlotProvider>
          </>
        )}
      </RACDropZone>
    </Provider>
  );
}

/**
 * A dropzone is an area into which one or multiple objects can be dragged and dropped.
 */
let _DropZone = React.forwardRef(DropZone);
export {_DropZone as DropZone};
