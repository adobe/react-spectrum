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

import {Key, RefObject} from '@react-types/shared';
import {LayoutInfo, Size} from '@react-stately/virtualizer';
import {useCallback} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

interface IVirtualizer {
  updateItemSize(key: Key, size: Size): void
}

export interface VirtualizerItemOptions {
  layoutInfo: LayoutInfo,
  virtualizer: IVirtualizer,
  ref: RefObject<HTMLElement | null>
}

export function useVirtualizerItem(options: VirtualizerItemOptions) {
  let {layoutInfo, virtualizer, ref} = options;

  let updateSize = useCallback(() => {
    if (layoutInfo) {
      let size = getSize(ref.current);
      virtualizer.updateItemSize(layoutInfo.key, size);
    }
  }, [virtualizer, layoutInfo?.key, ref]);

  useLayoutEffect(() => {
    if (layoutInfo?.estimatedSize) {
      updateSize();
    }
  });

  return {updateSize};
}

function getSize(node: HTMLElement) {
  // Reset height before measuring so we get the intrinsic size
  let height = node.style.height;
  node.style.height = '';
  let size = new Size(node.scrollWidth, node.scrollHeight);
  node.style.height = height;
  return size;
}
