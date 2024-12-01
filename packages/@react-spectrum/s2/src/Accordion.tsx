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

import {ContextValue, DisclosureGroup, DisclosureGroupProps, SlotProps} from 'react-aria-components';
import {DisclosureContext} from './Disclosure';
import {DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with { type: 'macro' };
import React, {createContext, forwardRef} from 'react';
import {style} from '../style' with { type: 'macro' };
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface AccordionProps extends Omit<DisclosureGroupProps, 'className' | 'style' | 'children'>, UnsafeStyles, DOMProps, SlotProps {
  /** The disclosure elements in the accordion. */
  children: React.ReactNode,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /**
   * The size of the accordion.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the disclosure items.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  /** Whether the accordion should be displayed with a quiet style. */
  isQuiet?: boolean
}

const accordion = style({
  display: 'flex',
  flexDirection: 'column'
}, getAllowedOverrides({height: true}));

export const AccordionContext = createContext<ContextValue<AccordionProps, DOMRefValue<HTMLDivElement>>>(null);

/**
 * An accordion is a container for multiple disclosures.
 */
export const Accordion = forwardRef(function Accordion(props: AccordionProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, AccordionContext);
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    size = 'M',
    density = 'regular',
    isQuiet
  } = props;
  return (
    <DisclosureContext.Provider value={{size, isQuiet, density}}>
      <DisclosureGroup
        {...props}
        ref={domRef}
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + accordion(null, props.styles)}>
        {props.children}
      </DisclosureGroup>
    </DisclosureContext.Provider>
  );
});
