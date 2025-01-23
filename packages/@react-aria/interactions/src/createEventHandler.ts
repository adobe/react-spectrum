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

import {BaseEvent} from '@react-types/shared';
import {SyntheticEvent} from 'react';

/**
 * This function wraps a React event handler to make stopPropagation the default, and support continuePropagation instead.
 */
export function createEventHandler<T extends SyntheticEvent>(handler?: (e: BaseEvent<T>) => void): ((e: T) => void) | undefined {
  if (!handler) {
    return undefined;
  }

  let shouldStopPropagation = true;
  return (e: T) => {
    let event: BaseEvent<T> = {
      ...e,
      preventDefault() {
        e.preventDefault();
      },
      isDefaultPrevented() {
        return e.isDefaultPrevented();
      },
      stopPropagation() {
        if (shouldStopPropagation) {
          console.error('stopPropagation is now the default behavior for events in React Spectrum. You can use continuePropagation() to revert this behavior.');
        } else {
          shouldStopPropagation = true;
        }
      },
      continuePropagation() {
        shouldStopPropagation = false;
      },
      isPropagationStopped() {
        return shouldStopPropagation;
      }
    };

    handler(event);

    if (shouldStopPropagation) {
      e.stopPropagation();
    }
  };
}
