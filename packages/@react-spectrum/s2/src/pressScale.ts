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

import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {CSSProperties, RefObject} from 'react';

/**
 * Returns a render prop style function that applies a subtle Spectrum "press" scale
 * effect to an element while it is being pressed.
 *
 * @param ref - A ref to the element receiving the press effect.
 * @param style - An optional base style object, or a render prop function returning
 * one.
 * @returns A render prop function suitable for passing to a React Aria component's
 * `style` prop.
 *
 * @example
 * ```tsx
 * import {Button} from 'react-aria-components/Button';
 * import {pressScale} from '@react-spectrum/s2';
 * import {useRef} from 'react';
 *
 * function MyButton(props) {
 *   let ref = useRef(null);
 *   return <Button {...props} ref={ref} style={pressScale(ref, props.style)} />;
 * }
 * ```
 */
export function pressScale<R extends {isPressed: boolean}>(
  ref: RefObject<HTMLElement | null>,
  style?: CSSProperties | ((renderProps: R) => CSSProperties)
): (renderProps: R) => CSSProperties {
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
