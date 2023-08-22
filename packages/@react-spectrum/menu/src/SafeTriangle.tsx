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

import React, {MutableRefObject, ReactElement, useCallback, useEffect, useState} from 'react';

interface SafeTriangleProps {
  /** Ref for the submenu. */
  subMenuRef: MutableRefObject<any>,
  /** Ref for the submenu's trigger element. */
  triggerRef: MutableRefObject<HTMLLIElement>
}

/**
 * Allows the user to move their pointer to the sub-menu without it closing
 * due to the mouse leaving the trigger element.
 */
export function SafeTriangle(props: SafeTriangleProps): ReactElement {
  let {
    subMenuRef,
    triggerRef
  } = props;
  let [style, setStyle] = useState<React.CSSProperties>({height: 0, width: 0});

  let onMouseMove = useCallback((e: MouseEvent) => {
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    if (subMenuRef.current && triggerRef.current && mouseY !== null) {
      let {left, right, top, height} = (subMenuRef.current?.UNSAFE_getDOMNode() as HTMLElement).getBoundingClientRect();
      let offset = triggerRef.current?.getBoundingClientRect().width;
      let direction = left > triggerRef.current?.getBoundingClientRect().left ? 'right' : 'left';

      let isVisible = (direction === 'right' && mouseX < left) || (direction === 'left' && mouseX > right);

      setStyle(isVisible ? {
        top: triggerRef.current?.getBoundingClientRect().top - triggerRef.current?.parentElement.getBoundingClientRect().top,
        left: direction === 'right' ? mouseX - left + offset : undefined,
        height,
        width: direction === 'right' ? left - mouseX : mouseX - right,
        clipPath: direction === 'right' ? `polygon(100% 0%, 0% ${(100 * (mouseY - top)) / height}%, 100% 100%)` : `polygon(0% 0%, 100% ${(100 * (mouseY - top)) / height}%, 0% 100%)`
      } : {
        height: 0,
        width: 0,
        display: 'none'
      });
    }
    
  }, [subMenuRef, triggerRef]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);

    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

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
