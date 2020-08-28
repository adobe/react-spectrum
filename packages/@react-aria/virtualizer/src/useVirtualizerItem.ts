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

import {RefObject, useCallback} from 'react';
import {ReusableView, Size} from '@react-stately/virtualizer';
import {useLayoutEffect} from '@react-aria/utils';

interface VirtualizerItemOptions<T extends object, V, W> {
  reusableView: ReusableView<T, V>,
  ref: RefObject<HTMLElement>
}

export function useVirtualizerItem<T extends object, V, W>(options: VirtualizerItemOptions<T, V, W>) {
  let {reusableView: {layoutInfo, virtualizer}, ref} = options;

  let updateSize = useCallback(() => {
    let size = getSize(ref.current);
    virtualizer.updateItemSize(layoutInfo.key, size);
  }, [virtualizer, layoutInfo.key, ref]);

  useLayoutEffect(() => {
    if (layoutInfo.estimatedSize) {
      updateSize();
    }
  });

  return {updateSize};
}

function getSize(node: HTMLElement) {
  return new Size(node.scrollWidth, node.scrollHeight);
}
