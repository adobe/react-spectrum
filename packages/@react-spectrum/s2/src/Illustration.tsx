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

import {cloneElement, createContext, ReactElement, SVGAttributes} from 'react';
import {filterDOMProps} from '@react-aria/utils';
import {AriaLabelingProps, DOMProps} from '@react-types/shared';
import {ContextValue, useContextProps} from 'react-aria-components';

export interface IllustrationProps extends DOMProps, AriaLabelingProps {
  /**
   * A screen reader only label for the Illustration.
   */
  'aria-label'?: string,
  /**
   * The content to display. Should be an SVG.
   */
  children: ReactElement,
  /**
   * A slot to place the illustration in.
   * @default 'illustration'
   */
  slot?: string,
  /**
   * Indicates whether the element is exposed to an accessibility API.
   */
  'aria-hidden'?: boolean | 'false' | 'true'
}

export const IllustrationContext = createContext<ContextValue<SVGAttributes<HTMLOrSVGImageElement>, HTMLOrSVGImageElement>>({});

export function Illustration(props: IllustrationProps) {
  [props] = useContextProps(props, null, IllustrationContext);

  let {
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-hidden': ariaHidden,
    ...otherProps
  } = props;

  let hasLabel = ariaLabel || ariaLabelledby;

  if (!ariaHidden) {
    ariaHidden = undefined;
  }
  
  return cloneElement(children, {
    ...filterDOMProps(otherProps),
    focusable: 'false',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-hidden': ariaHidden,
    role: hasLabel ? 'img' : undefined,
    ...props
  });
}
