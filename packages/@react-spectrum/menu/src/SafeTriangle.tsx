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

import React, {MutableRefObject, ReactElement, useEffect, useRef, useState} from 'react';

interface SafeTriangleProps {
  /** Ref for the submenu. */
  subMenuRef: MutableRefObject<any>,
  /** Ref for the submenu's trigger element. */
  triggerRef: MutableRefObject<HTMLLIElement>
}

const TOLERANCE = 5;

/**
 * Allows the user to move their pointer to the sub-menu without it closing when their mouse leaves the trigger element.
 * Renders an invisible triangle from the mouse position to the inside corners of the sub-menu.
 */
export function SafeTriangle(props: SafeTriangleProps): ReactElement {
  let {
    subMenuRef,
    triggerRef
  } = props;
  let [style, setStyle] = useState<React.CSSProperties>({height: 0, width: 0});
  let timeout = useRef<ReturnType<typeof setTimeout> | undefined>();

  useEffect(() => {
    let onMouseMove = (e: MouseEvent) => {
      let mouseX = e.clientX;
      let mouseY = e.clientY;
      if (subMenuRef.current && triggerRef.current) {
        let {left, right, top, height} = (subMenuRef.current?.UNSAFE_getDOMNode() as HTMLElement).getBoundingClientRect();
        let triggerRect = triggerRef.current?.getBoundingClientRect();
        let offset = triggerRect.width;
        let direction = left > triggerRect.left ? 'right' : 'left';

        let isHidden = (direction === 'right' && mouseX > left) || (direction === 'left' && mouseX < right);

        // If mouse is outside of the trigger element, start a timer. If mouse doesn't return to the trigger element before the timer ends, close the menu.
        let isMouseOutsideTriggerElement = mouseY < triggerRect.top || mouseY > triggerRect.bottom;
        if (isMouseOutsideTriggerElement) {
          if (timeout.current) {
            clearTimeout(timeout.current);
          }
          timeout.current = setTimeout(() => setStyle({height: 0, width: 0}), 1000);
        } else {
          clearTimeout(timeout.current);
          timeout.current = undefined;
        }

        setStyle(isHidden ? {
          height: 0,
          width: 0
        } : {
          top: triggerRect.top - triggerRef.current?.parentElement.getBoundingClientRect().top,
          left: direction === 'right' ? mouseX - left + offset - TOLERANCE : -TOLERANCE,
          height,
          width: direction === 'right' ? left - mouseX + TOLERANCE : mouseX - right + TOLERANCE,
          clipPath: direction === 'right' ? `polygon(100% 0%, 0% ${(100 * (mouseY - top)) / height}%, 100% 100%)` : `polygon(0% 0%, 100% ${(100 * (mouseY - top)) / height}%, 0% 100%)`
        });
      }
    };
  
    window.addEventListener('mousemove', onMouseMove);

    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [subMenuRef, triggerRef]);

  return (
    <div
      aria-hidden="true"
      style={{
        zIndex: 1,
        position: 'absolute',
        // TODO: make transparent
        backgroundColor: 'red',
        ...style
      }} />
  );
}
