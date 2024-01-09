/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {RefObject} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

export function usePressScale(ref: RefObject<HTMLElement>, isPressed: boolean, isDisabled: boolean = false) {
  useLayoutEffect(() => {
    if (!ref.current || isDisabled) {
      return;
    }

    if (isPressed) {
      let {width = 0, height = 0} = ref.current?.getBoundingClientRect() ?? {};
      let transform = `perspective(max(${height}px, ${ width / 3}px)) translate3d(0, 0, -2px)`;
      ref.current.style.setProperty('transform', transform);
    } else {
      ref.current.style.setProperty('transform', '');
    }
  }, [ref, isPressed, isDisabled]);
}
