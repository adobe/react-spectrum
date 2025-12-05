/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';

/**
 * Applies container bounds positioning to a style object.
 * When containerBounds are provided, positions the element relative to the container instead of the viewport.
 */
export function applyContainerBounds(
  style: React.CSSProperties,
  containerBounds: DOMRect | null | undefined,
  options?: {
    /** Whether to add flexbox centering (for modals). */
    center?: boolean
  }
): void {
  if (!containerBounds) {
    return;
  }

  const {center = false} = options || {};

  // Set positioning relative to container bounds
  style.position = 'fixed';
  style.top = containerBounds.top + 'px';
  style.left = containerBounds.left + 'px';
  style.width = containerBounds.width + 'px';
  style.height = containerBounds.height + 'px';

  // Add flexbox centering if requested
  if (center) {
    style.display = 'flex';
    style.flexDirection = 'column';
  }
}

