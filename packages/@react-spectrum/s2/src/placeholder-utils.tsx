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

import {RefObject, useEffect} from 'react';
import {useEffectEvent, useEvent} from '@react-aria/utils';

export function usePlaceholderWarning(placeholder: string | undefined, componentType: string, inputRef: RefObject<HTMLInputElement | null>): void {
  let checkPlaceholder = useEffectEvent((input: HTMLInputElement | null) => {
    if (!placeholder && input) {
      if (document.activeElement !== input && (!input.value || input.value === '') && process.env.NODE_ENV !== 'production') {
        console.warn(`Your ${componentType} is empty and not focused but doesn't have a placeholder. Please add one.`);
      }
    }
  });

  useEffect(() => {
    checkPlaceholder(inputRef.current);
  }, [checkPlaceholder, inputRef]);

  useEvent(inputRef, 'blur', (e) => checkPlaceholder(e.target as HTMLInputElement));
}
