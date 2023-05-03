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

import {ContextValue, DOMProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {DropOptions, mergeProps, useButton, useDrop, useFocusRing, useHover} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface DropZoneProps extends Omit<DropOptions, 'onDropActivate' | 'onInsert' | 'onRootDrop' | 'onItemDrop' | 'onReorder'>, DOMProps, SlotProps {}

export const DropZoneContext = createContext<ContextValue<DropZoneProps, HTMLDivElement>>(null);

function DropZone(props: DropZoneProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, DropZoneContext);
  let {dropProps, isDropTarget} = useDrop({...props, ref});
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let {hoverProps, isHovered} = useHover({});
  let {buttonProps} = useButton({elementType: 'div'}, ref);
  let renderProps = useRenderProps({ 
    ...props,
    values: {isHovered, isFocused, isFocusVisible, isDropTarget},
    defaultClassName: 'react-aria-DropZone'
  });

  return (
    <div
      {...mergeProps(dropProps, focusProps, hoverProps, buttonProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot} 
      data-hovered={isHovered || isDropTarget || undefined} 
      data-focused={isFocused || undefined} 
      data-focus-visible={isFocusVisible || undefined}> 
      {renderProps.children}
    </div>
  );
}

/**
 A drop zone is an area into which an object can be dragged and dropped.
 */
const _DropZone = forwardRef(DropZone);
export {_DropZone as DropZone};
