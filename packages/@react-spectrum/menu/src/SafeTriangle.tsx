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

import React, {MutableRefObject, ReactElement, useEffect, useState} from 'react';

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
  let [mousePosition, setMousePosition] = useState<{mouseX: number, mouseY: number}>({mouseX: null, mouseY: null});
  let {mouseX, mouseY} = mousePosition;
  let updateMousePosition = (e: MouseEvent) => {
    setMousePosition({mouseX: e.clientX, mouseY: e.clientY});
  };

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition);

    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;
  let direction: 'left' | 'right';
  let subMenuNode = subMenuRef.current?.UNSAFE_getDOMNode() as HTMLElement;
  if (subMenuNode) {
    let rect = subMenuNode.getBoundingClientRect();
    x = rect.left;
    y = rect.top;
    width = mouseX > x ? 0 : x - mouseX + 5;
    height = rect.height;
    direction = x > triggerRef.current?.getBoundingClientRect().left ? 'right' : 'left';
  } else {
    return null;
  }

  if (direction === 'right' && mouseX > x) {
    return null;
  } else if (direction === 'left' && mouseX < x) {
    return null;
  }

  let offset = triggerRef.current?.getBoundingClientRect().width;
  let top = triggerRef.current?.getBoundingClientRect().top - triggerRef.current?.parentElement.getBoundingClientRect().top;
  let left = -1 * (x - mouseX) + offset - 7;
  let clipPath = `polygon(100% 0%, 0% ${(100 * (mouseY - y)) / height}%, 100% 100%)`;

  return (
    <div
      style={{
        zIndex: 1,
        position: 'absolute',
        // TODO: make transparent
        backgroundColor: 'red',
        top,
        left,
        height,
        width,
        clipPath
      }} />
  );
}
