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

import {ContextValue, Separator as RACSeparator, SeparatorProps as RACSeparatorProps} from 'react-aria-components';
import {createContext, forwardRef} from 'react';
import {DOMRef, DOMRefValue} from '@react-types/shared';
import {getAllowedOverrides, staticColor, StyleProps} from './style-utils' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

/*
 * Adding as it's own type to deal with size being a part of the theme so we
 * can type style() and it's parameters.
 */
interface DividerSpectrumProps {
  /**
   * How thick the Divider should be.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L',
  /**
   * How thick the Divider should be.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical',
  /** The static color style to apply. Useful when the Divider appears over a color background. */
  staticColor?: 'white' | 'black' | 'auto'
}

// TODO: allow overriding height (only when orientation is vertical)??
export interface DividerProps extends DividerSpectrumProps, Omit<RACSeparatorProps, 'className' | 'style' | 'elementType'>, StyleProps {}

export const DividerContext = createContext<ContextValue<DividerProps, DOMRefValue>>(null);

export const divider = style<DividerSpectrumProps & {isStaticColor: boolean}>({
  ...staticColor(),
  alignSelf: 'stretch',
  backgroundColor: {
    default: 'gray-200',
    size: {
      L: 'gray-800'
    },
    isStaticColor: {
      default: 'transparent-overlay-200',
      size: {
        L: 'transparent-overlay-800'
      }
    },
    forcedColors: 'ButtonBorder'
  },
  borderStyle: 'none',
  borderRadius: 'full',
  margin: 0,
  height: {
    orientation: {
      horizontal: {
        // These should be px not rems, because we're emulating a border.
        default: '[2px]',
        size: {
          S: '[1px]',
          L: '[4px]'
        }
      }
    }
  },
  width: {
    orientation: {
      vertical: {
        default: '[2px]',
        size: {
          S: '[1px]',
          L: '[4px]'
        }
      }
    }
  }
}, getAllowedOverrides());

/**
 * Dividers bring clarity to a layout by grouping and dividing content in close proximity.
 * They can also be used to establish rhythm and hierarchy.
 */
export const Divider = /*#__PURE__*/ forwardRef(function Divider(props: DividerProps, ref: DOMRef) {
  [props, ref] = useSpectrumContextProps(props, ref, DividerContext);
  let domRef = useDOMRef(ref);

  return (
    <RACSeparator
      {...props}
      ref={domRef}
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + divider({
        size: props.size || 'M',
        orientation: props.orientation || 'horizontal',
        staticColor: props.staticColor,
        isStaticColor: !!props.staticColor
      }, props.styles)} />
  );
});
