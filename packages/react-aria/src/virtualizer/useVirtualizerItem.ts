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

import {isElementVisible} from '../utils/isElementVisible';
import {Key, RefObject} from '@react-types/shared';
import {LayoutInfo, Size} from 'react-stately/useVirtualizerState';
import {useCallback, useEffect} from 'react';
import {useEffectEvent} from '../utils/useEffectEvent';
import {useLayoutEffect} from '../utils/useLayoutEffect';

interface IVirtualizer {
  updateItemSize(key: Key, size: Size): void;
}

interface Measurement {
  key: Key;
  ref: RefObject<HTMLElement | null>;
  virtualizer: IVirtualizer;
}

let pendingMeasurements = new Map<HTMLElement, Measurement>();
let isMeasurementQueued = false;

export interface VirtualizerItemOptions {
  layoutInfo: LayoutInfo | null;
  virtualizer: IVirtualizer;
  ref: RefObject<HTMLElement | null>;
  shouldObserveItemSize?: boolean;
}

export function useVirtualizerItem(options: VirtualizerItemOptions): {updateSize: () => void} {
  let {layoutInfo, virtualizer, ref, shouldObserveItemSize} = options;
  let key = layoutInfo?.key;

  let updateSize = useCallback(() => {
    if (key != null && ref.current) {
      queueMeasure(ref.current, {key, ref, virtualizer});
    }
  }, [virtualizer, key, ref]);

  let updateSizeEvent = useEffectEvent(updateSize);

  useLayoutEffect(() => {
    if (layoutInfo?.estimatedSize) {
      updateSizeEvent();
    }
  });

  // TODO: Consider using a MutationObserver in addition to ResizeObserver to detect
  // when inner DOM structure changes cause an item's height to change.
  // The current ResizeObserver only observes direct children,
  // so mutations deeper in the tree won't trigger a remeasure, leading to stale cached heights and overlapping items.
  // useResizeObserver observes one element via ref, but the wrapper height is fixed by layout
  // and won't change when content grows. Observe direct children instead, then remeasure the
  // wrapper in updateSize.
  useEffect(() => {
    if (!shouldObserveItemSize) {
      return;
    }

    let el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }

    let resizeObserver = new ResizeObserver(entries => {
      if (!entries.length) {
        return;
      }
      updateSizeEvent();
    });

    for (let child of el.children) {
      resizeObserver.observe(child);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [shouldObserveItemSize, ref, key]);

  return {updateSize};
}

function queueMeasure(node: HTMLElement, measurement: Measurement) {
  pendingMeasurements.set(node, measurement);

  if (!isMeasurementQueued) {
    isMeasurementQueued = true;
    queueMicrotask(measureItems);
  }
}

function measureItems() {
  let pending = pendingMeasurements;
  pendingMeasurements = new Map();
  isMeasurementQueued = false;
  let measurements = [...pending].filter(([node, {ref}]) => {
    // If the virtualized item is not visible (e.g. display: none on a virtualized collection),
    // avoid reporting size 0. Otherwise, the virtualizer could render 0 items while hidden and
    // would not remeasure when it becomes visible again.
    return ref.current === node && isElementVisible(node);
  });

  let heights = measurements.map(([node]) => node.style.height);
  for (let [node] of measurements) {
    node.style.height = '';
  }

  let sizes = measurements.map(([node]) => new Size(node.scrollWidth, node.scrollHeight));

  for (let [index, [node]] of measurements.entries()) {
    node.style.height = heights[index];
  }

  for (let [index, [, {key, virtualizer}]] of measurements.entries()) {
    virtualizer.updateItemSize(key, sizes[index]);
  }
}
