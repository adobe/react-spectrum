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

export interface AriaSafeAreaOptions {
  /** Ref for the submenu. */
  subMenuRef: MutableRefObject<any>,
  /** Ref for the submenu's trigger element. */
  triggerRef: MutableRefObject<HTMLLIElement>
}

/**
 * Utility for rendering a safe area for a sub-menu.
 * This allows the user to mouse to the sub-menu without it closing.
 * @param props
 */
export function SafeTriangle(props: AriaSafeAreaOptions): ReactElement {
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
  }

  let offset = triggerRef.current?.getBoundingClientRect().width;
  let clipPath = mouseX > x ? undefined : `polygon(100% 0%, 0% ${(100 * (mouseY - y)) / height}%, 100% 100%)`;
  let right = mouseX > x ? -1 * (mouseX - (x + height)) : undefined;
  let left =  mouseX > x ? undefined : -1 * (x - mouseX) + offset - 5;
  let top = triggerRef.current?.getBoundingClientRect().top - triggerRef.current?.parentElement.getBoundingClientRect().top;

  if (direction === 'right' && mouseX > x) {
    return null;
  } else if (direction === 'left' && mouseX < x) {
    return null;
  }

  return (
    <div
      style={{
        // TODO: Increment above submenu's z-index
        zIndex: 1,
        position: 'absolute',
        top,
        // TODO: make transparent
        backgroundColor: 'red',
        right,
        left,
        height,
        width,
        clipPath
      }} />
  );
}
