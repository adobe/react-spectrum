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
export function createEventHandler<T extends SyntheticEvent>(handler: (e: BaseEvent<T>) => void): (e: T) => void {
  if (!handler) {
    return;
  }

  let shouldStopPropagation = true;
  return (e: T) => {
    // Mutates the original event object to support Preact because we aren't dealing
    // with synthetic events. The event object that Preact passes to this function
    // does not have very many of its "own" properties; rather, it inherits most of
    // its properties from KeyboardEvents, which means using the spread operator will
    // not transfer the properties to our new `event` object. If we were to either
    // try to copying the properties from the original event's prototype or using
    // that original event as the prototype of this new object, we would actually get
    // an illegal-invokation error as soon as we started using it.
    let event: BaseEvent<T> = Object.assign(e, {
      stopPropagation() {
        console.error('stopPropagation is now the default behavior for events in React Spectrum. You can use continuePropagation() to revert this behavior.');
      },
      continuePropagation() {
        shouldStopPropagation = false;
      }
    });

    handler(event);

    if (shouldStopPropagation) {
      e.stopPropagation();
    }
  };
}
