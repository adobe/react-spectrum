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

import {ButtonContext} from './Button';
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import type {DragAndDropHooks} from '@react-spectrum/dnd';
import {DropOptions, mergeProps, useButton, useClipboard, useDrop, useFocusRing, useHover, usePress, VisuallyHidden} from 'react-aria';
import {InputContext} from './Input';
import {LinkContext} from './Link';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
export interface DropZoneRenderProps {
  /**
   * Whether the dropzone is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the dropzone is focused, either via a mouse or keyboard.
   * @selector :focus
   */
  isFocused: boolean,
  /**
   * Whether the dropzone is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the dropzone is the drop target.
   * @selector [data-drop-target]
   */
  isDropTarget: boolean
}
// note: possibly add isDisabled prop in the future
export interface DropZoneProps extends Omit<DropOptions, 'getDropOperationForPoint' | 'onDropActivate' | 'onInsert' | 'onRootDrop' | 'onItemDrop' | 'onReorder'>, 
  RenderProps<DropZoneRenderProps>, SlotProps {
    dragAndDropHooks?: DragAndDropHooks['dragAndDropHooks']
  }

export const DropZoneContext = createContext<ContextValue<DropZoneProps, HTMLDivElement>>(null);

function DropZone(props: DropZoneProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, DropZoneContext);
  let {dragAndDropHooks} = props;
  let {dropProps, isDropTarget} = useDrop({...props, ref});
  let {hoverProps, isHovered} = useHover({});
  let {focusProps, isFocused, isFocusVisible} = useFocusRing({within: true});
  let buttonRef = useRef<HTMLButtonElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);
  let uploadLinkRef = useRef<HTMLAnchorElement>(null);
  let uploadButtonRef = useRef<HTMLButtonElement>(null);
  let hasInputLink = uploadLinkRef.current || uploadButtonRef.current;

  console.log(dragAndDropHooks);
  console.log(dragAndDropHooks?.isVirtualDragging());

  let {buttonProps} = useButton({
    onPress: () => {
      if (inputRef.current) {
        return inputRef.current.click();
      }
      return undefined;
    }},
    buttonRef);

  let {clipboardProps} = useClipboard({
    onPaste: (items) => props.onDrop?.({  
      type: 'drop',
      items,
      x: 0,
      y: 0,
      dropOperation: 'copy'
    })
  });

  let renderProps = useRenderProps({ 
    ...props,
    values: {isHovered, isFocused, isFocusVisible, isDropTarget},
    defaultClassName: 'react-aria-DropZone'
  });

  let {pressProps} = usePress({
    ref,
    onPress: () => {
      if (inputRef.current && !hasInputLink) { // !hasInputLink prevents the whole dropzone from being clickable when there is an button or link
        inputRef.current.click();
      }
    }
  });

  let onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    } else if (props.onDrop) {
      props.onDrop({
        type: 'drop',
        dropOperation: 'copy',
        x: 0,
        y: 0,
        items: [...e.target.files].map((file) =>
          ({
            kind: 'file', 
            type: file.type, 
            name: file.name,
            getFile: () => Promise.resolve(file),
            getText: () => Promise.resolve('')
          })
        )
      }
      );
    }
  };
  
  // with a single button
  return (
    <Provider
      values={[
        [InputContext, {ref: inputRef, type: 'file', style: {display: 'none'}, onChange: onInputChange}],
        [LinkContext, {slot: 'file', onPress: () => inputRef.current?.click(), ref: uploadLinkRef}], 
        [ButtonContext, {slot: 'file', onPress: () => inputRef.current?.click(), ref: uploadButtonRef}]
      ]}>
      <div
        {...mergeProps(dropProps, hoverProps, pressProps)}
        {...renderProps} 
        ref={ref}
        slot={props.slot} 
        tabIndex={-1} 
        data-hovered={isHovered || undefined}
        data-focused={isFocused || undefined} 
        data-focus-visible={isFocusVisible || undefined}
        data-drop-target={isDropTarget || undefined} > 
        {!hasInputLink && <VisuallyHidden>
          <button 
            {...mergeProps(buttonProps, focusProps, clipboardProps)}
            ref={buttonRef} 
            // follow up: update this to translated string
            // if there is no input, then say something like 'dropzone' -> this is subject to change
            aria-label={inputRef.current ? 'Press enter to select a file' : 'dropzone'} /> 
        </VisuallyHidden>}
        {renderProps.children}
      </div>
    </Provider>
  );

  // two buttons

  // return (
  //   <Provider
  //     values={[
  //       [InputContext, {ref: inputRef, type: 'file', style: {display: 'none'}, onChange: onInputChange}],
  //       [LinkContext, {slot: 'file', onPress: () => inputRef.current?.click(), ref: uploadLinkRef}], 
  //       [ButtonContext, {slot: 'file', onPress: () => inputRef.current?.click(), ref: uploadButtonRef}]
  //     ]}>
  //     <div
  //       {...mergeProps(dropProps, hoverProps, pressProps)}
  //       {...renderProps}
  //       // isVirtualDragging={dragAndDropHooks?.isVirtualDragging()}
  //       ref={ref}
  //       slot={props.slot} 
  //       tabIndex={-1} 
  //       data-hovered={isHovered || undefined}
  //       data-focused={isFocused || undefined} 
  //       data-focus-visible={isFocusVisible || undefined}
  //       data-drop-target={isDropTarget || undefined} > 
  //       {!hasInputLink && <VisuallyHidden>
  //         <button 
  //           {...mergeProps(buttonProps, focusProps, clipboardProps)}
  //           ref={buttonRef} 
  //           // follow up: update this to translated string
  //           aria-label={inputRef.current ? 'Press enter to select a file' : 'dropzone-area'} /> 
  //       </VisuallyHidden>}
  //       {renderProps.children}
  //     </div>
  //   </Provider>
  // );
}

/**
 A drop zone is an area into which an object can be dragged and dropped.
 */
const _DropZone = forwardRef(DropZone);
export {_DropZone as DropZone};
