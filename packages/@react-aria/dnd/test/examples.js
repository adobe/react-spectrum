/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useButton} from '@react-aria/button';
import {useDrag, useDrop} from '../';

export function Draggable(props) {
  let {dragProps, dragButtonProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    ...props
  });

  let ref = React.useRef();
  let {buttonProps} = useButton({...dragButtonProps, elementType: 'div'}, ref);

  return (
    <div
      ref={ref}
      {...mergeProps(dragProps, buttonProps)}
      data-dragging={isDragging}>
      {props.children || 'Drag me'}
    </div>
  );
}

export function Droppable(props) {
  let ref = React.useRef();
  let {dropProps, isDropTarget} = useDrop({
    ref,
    ...props
  });

  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <div
      {...mergeProps(dropProps, buttonProps)}
      ref={ref}
      data-droptarget={isDropTarget}>
      {props.children || 'Drop here'}
    </div>
  );
}

