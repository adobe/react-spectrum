/*
 * Copyright 2026 Adobe. All rights reserved.
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

export const useAction = typeof React['useTransition'] === 'function' && typeof React['useOptimistic'] === 'function'
  ? useActionModern
  : useActionLegacy;

export function useActionModern(action: ((...args: any[]) => void | Promise<void>) | null | undefined): [((...args: any[]) => void) | undefined, boolean] {
  let [isPending, transition] = React.useTransition();
  let onEvent = (...args: any[]) => {
    transition(async () => {
      await action!(...args);
    });
  };

  return [action ? onEvent : undefined, isPending];
}

export function useActionLegacy(action: ((...args: any[]) => void | Promise<void>) | null | undefined): [((...args: any[]) => void) | undefined, boolean] {
  if (action) {
    throw new Error('Actions are only supported in React 19 and later.');
  }

  return [undefined, false];
}
