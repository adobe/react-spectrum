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

import {DropOptions, mergeProps, useFocusRing, useHover, useDrop, AriaFocusRingProps, HoverProps} from 'react-aria';
import {ContextValue, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

// props are subject to change
export interface DropZoneProps extends Omit<DropOptions, 'onDropActivate' | 'getDropOperation' | 'onInsert' | 'onRootDrop' | 'onItemDrop' | 'onReorder'>, SlotProps, AriaFocusRingProps, HoverProps {};

export const DropZoneContext = createContext<ContextValue<DropZoneProps, HTMLDivElement>>(null);

function DropZone(props: DropZoneProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, DropZoneContext);
  let {dropProps} = useDrop(props);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);

  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isFocused, isFocusVisible},
    defaultClassName: 'react-aria-DropZone' // is this what we want to call this?
  });

  return (
    <div
        {...mergeProps(dropProps, focusProps, hoverProps)}
        {...renderProps}
        ref={ref}
        slot={props.slot}

        // i'm guessing we want these? are there any other ones we want to add
        data-hovered={isHovered || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
    >

    </div>
  );
}

/**
 A drop zone is an area into which an object can be dragged and dropped. It's a common interaction in uploading and file management workflows.
 */
const _DropZone = forwardRef(DropZone);
export {_DropZone as DropZone};
