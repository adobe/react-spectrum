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
    // Do not try to spread the event here because the getters of classes (native DOM events)
    // aren't enumerated.
    let prevStopPropagation = e.stopPropagation;
    e.stopPropagation = ()=> {
      console.error('stopPropagation is now the default behavior for events in React Spectrum. You can use continuePropagation() to revert this behavior.');
    };
    // @ts-ignore
    e.continuePropagation = () =>{
      shouldStopPropagation = false;
    }

    // @ts-ignore
    handler(e);

    e.stopPropagation = prevStopPropagation;
    // @ts-ignore
    delete e.continuePropagation;

    if (shouldStopPropagation) {
      e.stopPropagation();
    }
  };
}
