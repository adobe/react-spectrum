/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {composeRenderProps} from 'react-aria-components';
import {CSSProperties, RefObject} from 'react';

export function pressScale<R extends {isPressed: boolean}>(ref: RefObject<HTMLElement | null>, style?: CSSProperties | ((renderProps: R) => CSSProperties)) {
  return composeRenderProps(style, (style, renderProps: R) => {
    if (renderProps.isPressed && ref.current) {
      let {width = 0, height = 0} = ref.current.getBoundingClientRect() ?? {};
      return {
        ...style,
        willChange: `${style?.willChange ?? ''} transform`,
        transform: `${style?.transform ?? ''} perspective(${Math.max(height, width / 3, 24)}px) translate3d(0, 0, -2px)`
      };
    } else {
      return {
        ...style,
        willChange: `${style?.willChange ?? ''} transform`
      };
    }
  });
}
