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
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import {DropOptions, mergeProps, useClipboard, useDrop, VisuallyHidden} from 'react-aria';
// import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import React, {ReactNode, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/dropzone/vars.css';

export interface SpectrumDropZoneProps extends Omit<DropOptions, 'getDropOperationForPoint'>, DOMProps, StyleProps {
  // for the illustrated message?
  children: ReactNode
}

function DropZone(props: SpectrumDropZoneProps) {
  let {children, ...otherProps} = props;
  let buttonRef = useRef<HTMLButtonElement>(null);
  let styleProps = useStyleProps(otherProps); // will probably take something like otherProps but just for now this is what it is 
  let {dropProps, dropButtonProps, isDropTarget} = useDrop({...props, ref: buttonRef, hasDropButton: true});

  // will need to think about this a bit more but i think this is a state we will need to track for styling purposes
  let [isFilled, setIsFilled] = useState(false); // what can we use to determine if dropzone is filled? onDrop? onChange?

  let {clipboardProps} = useClipboard({
    onPaste: (items) => props.onDrop?.({
      type: 'drop',
      items,
      x: 0,
      y: 0,
      dropOperation: 'copy'
    })
  });

  return (
    <div
      {...styleProps}
      {...mergeProps(dropProps)}
      data-drop-target={isDropTarget || undefined}
      className={
        classNames(
          styles,
          'spectrum-DropZone'
        )
      }>
      <VisuallyHidden>
        <button 
          {...mergeProps(dropButtonProps, clipboardProps)}
          ref={buttonRef} />
      </VisuallyHidden>
      {/* will need to render children (specifically IllustratedMessage) here */}
      {children}
    </div>
  );
}
let _DropZone = React.forwardRef(DropZone);
export {_DropZone as DropZone};
