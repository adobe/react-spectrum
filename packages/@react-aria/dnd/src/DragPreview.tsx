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

import {DragItem, DragPreviewRenderer} from '@react-types/shared';
import {flushSync} from 'react-dom';
import React, {ForwardedRef, JSX, useEffect, useImperativeHandle, useRef, useState} from 'react';

export interface DragPreviewProps {
  /**
   * A render function which returns a preview element, or an object containing the element
   * and a custom offset. If an object is returned, the provided `x` and `y` values will be
   * used as the drag preview offset instead of the default calculation.
   */
  children: (items: DragItem[]) => JSX.Element | {element: JSX.Element, x: number, y: number} | null
}

export const DragPreview:
  React.ForwardRefExoticComponent<DragPreviewProps & React.RefAttributes<DragPreviewRenderer | null>> =
React.forwardRef(function DragPreview(props: DragPreviewProps, ref: ForwardedRef<DragPreviewRenderer | null>) {
  let render = props.children;
  let [children, setChildren] = useState<JSX.Element | null>(null);
  let domRef = useRef<HTMLDivElement | null>(null);
  let raf = useRef<ReturnType<typeof requestAnimationFrame> | undefined>(undefined);

  useImperativeHandle(ref, () => (items: DragItem[], callback: (node: HTMLElement | null, x?: number, y?: number) => void) => {
    // This will be called during the onDragStart event by useDrag. We need to render the
    // preview synchronously before this event returns so we can call event.dataTransfer.setDragImage.

    let result = render(items);
    let element: JSX.Element | null;
    let offsetX: number | undefined;
    let offsetY: number | undefined;

    if (result && typeof result === 'object' && 'element' in result) {
      element = result.element;
      offsetX = result.x;
      offsetY = result.y;
    } else {
      element = result as JSX.Element | null;
    }

    flushSync(() => {
      setChildren(element);
    });

    // Yield back to useDrag to set the drag image.
    callback(domRef.current, offsetX, offsetY);

    // Remove the preview from the DOM after a frame so the browser has time to paint.
    raf.current = requestAnimationFrame(() => {
      setChildren(null);
    });
  }, [render]);

  useEffect(() => {
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, []);

  if (!children) {
    return null;
  }

  return (
    <div style={{zIndex: -100, position: 'absolute', top: 0, left: -100000}} ref={domRef}>
      {children}
    </div>
  );
});
