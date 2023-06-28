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
import {DropOptions, mergeProps, useDrop} from 'react-aria';
import {filterDOMProps} from '@react-aria/utils';
import {DropZone as RACDropZone} from 'react-aria-components';
import React, {ReactNode, Ref, useEffect, useImperativeHandle, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/dropzone/vars.css';
export interface SpectrumDropZoneProps extends Omit<DropOptions, 'getDropOperationForPoint' | 'ref' | 'hasDropButton'>, DOMProps, StyleProps, AriaLabelingProps {
  children: ReactNode
}

export interface DropZoneRef extends FocusableRefValue<HTMLInputElement, HTMLDivElement> {
  getInputElement(): HTMLInputElement | HTMLTextAreaElement | null
}

// what ref do we need? (follow TextField)
function DropZone(props: SpectrumDropZoneProps, ref: Ref<DropZoneRef>) {
  let {children, ...otherProps} = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useRef<HTMLDivElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  let [isFilled, setIsFilled] = useState(false);

  let domProps = filterDOMProps(props, {labelable: true});
  delete domProps.id;

  // Expose imperative interface for ref
  useImperativeHandle(ref, () => ({
    ...createFocusableRef(domRef, inputRef),
    getInputElement() {
      return inputRef.current;
    }
  }));
  
  return (
    <RACDropZone
      {...mergeProps(otherProps, domProps)}
      {...styleProps} // not really sure what to do about this
      className={
      classNames(
        styles,
        'spectrum-Dropzone',
        styleProps.className
      )} 
      ref={domRef}>
      {isFilled && // isDropTarget (but this idk how to get this value...)
        <div
          className={
            classNames(
              styles,
              'spectrum-Dropzone-banner'
            )
          }>
          Drop file to replace
        </div>}
      <SlotProvider
        slots={{
          illustration: {UNSAFE_className: classNames(styles, 'spectrum-IllustratedMessage')}, 
          // content: {UNSAFE_className: classNames(styles, 'spectrum-IllustratedMessage-description'), onChange: () => setIsFilled(true)}
        }}> 
        {children}
      </SlotProvider>
    </RACDropZone>
  );
}

let _DropZone = React.forwardRef(DropZone);
export {_DropZone as DropZone};
