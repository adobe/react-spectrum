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

import {CSSProperties, RefObject} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

export function pressScale(ref: RefObject<HTMLElement>, style: CSSProperties) {
  return ({isPressed}: {isPressed: boolean}) => {
    if (isPressed) {
      let height = ref.current!.offsetHeight;
      let width = ref.current!.offsetWidth;
      let scale = 2;
      if (width > 100) {
        scale = 1;
      }
      let transform = window.getComputedStyle(ref.current!).transform;
      if (transform === 'none') {
        transform = '';
      }
      return {
        ...style,
        transform: `${transform} scale(${(height - scale) / height})`
      };
    } else {
      return style;
    }
  };
}
