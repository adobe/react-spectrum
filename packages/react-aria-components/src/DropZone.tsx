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
import {AriaFocusRingProps, DropOptions, HoverProps, mergeProps, useDrop, useFocusRing, useHover} from 'react-aria';
import {ContextValue, DOMProps, SlotProps, useContextProps, useRenderProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

// props are subject to change
export interface DropZoneProps extends Omit<DropOptions, 'onDropActivate' | 'getDropOperation' | 'onInsert' | 'onRootDrop' | 'onItemDrop' | 'onReorder'>, DOMProps, SlotProps, AriaFocusRingProps, HoverProps {}

export const DropZoneContext = createContext<ContextValue<DropZoneProps, HTMLDivElement>>(null);

function DropZone(props: DropZoneProps, ref: ForwardedRef<HTMLDivElement>) {

  /* 
  feeling like we'll need some default text that will be initially displayed until something is dropped into DropZone in which we'll update the text that is shown
  */

  [props, ref] = useContextProps(props, ref, DropZoneContext);
  let {dropProps, isDropTarget} = useDrop({ref, ...props});
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);

  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isFocused, isFocusVisible, isDropTarget},
    defaultClassName: 'react-aria-DropZone' // is this what we want to call this?
  });


  return (
    <div
      {...mergeProps(dropProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot}

      // i'm guessing we want these? are there any other ones we want to add? what about isDropTarget?
      data-hovered={isHovered || isDropTarget || undefined} 
      data-focused={isFocused || undefined} 
      data-focus-visible={isFocusVisible || undefined}> 
      {props.children}
    </div>
  );
}

/**
 A drop zone is an area into which an object can be dragged and dropped.
 */
const _DropZone = forwardRef(DropZone);
export {_DropZone as DropZone};
