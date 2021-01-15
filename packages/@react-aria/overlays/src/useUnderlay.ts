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

/**
 * Used when there is an underlay component with the overlay, like a Dialog.
 */
export function useUnderlay() {
  let events;
  let onPointerDown = (e) => {
    e.preventDefault();
  };

  // Use pointer events if available. Otherwise, fall back to mouse and touch events.
  if (typeof PointerEvent !== 'undefined') {
    let onPointerUp = (e) => {
      e.preventDefault();
    };
    events = {
      onPointerDown,
      onPointerUp
    };
  } else {
    let onMouseUp = (e) => {
      e.preventDefault();
    };

    let onTouchEnd = (e) => {
      e.preventDefault();
    };
    events = {
      onMouseDown: onPointerDown,
      onTouchStart: onPointerDown,
      onMouseUp,
      onTouchEnd
    };
  }
  return {
    underlayProps: events
  };
}
