/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Key, LayoutDelegate, Rect, RefObject, Size} from '@react-types/shared';

export class DOMLayoutDelegate implements LayoutDelegate {
  private ref: RefObject<HTMLElement>;

  constructor(ref: RefObject<HTMLElement>) {
    this.ref = ref;
  }

  getItemRect(key: Key): Rect | null {
    let container = this.ref.current;
    let item = key != null ? container.querySelector(`[data-key="${CSS.escape(key.toString())}"]`) : null;
    if (!item) {
      return null;
    }

    let containerRect = container.getBoundingClientRect();
    let itemRect = item.getBoundingClientRect();

    return {
      x: itemRect.left - containerRect.left + container.scrollLeft,
      y: itemRect.top - containerRect.top + container.scrollTop,
      width: itemRect.width,
      height: itemRect.height
    };
  }

  getContentSize(): Size {
    let container = this.ref.current;
    return {
      width: container.scrollWidth,
      height: container.scrollHeight
    };
  }

  getVisibleRect(): Rect {
    let container = this.ref.current;
    return {
      x: container.scrollLeft,
      y: container.scrollTop,
      width: container.offsetWidth,
      height: container.offsetHeight
    };
  }
}
