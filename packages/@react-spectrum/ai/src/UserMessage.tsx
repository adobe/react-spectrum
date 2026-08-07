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

import {AriaLabelingProps, DOMProps, DOMRef} from '@react-types/shared';
import {DEFAULT_SLOT, Provider, SlotProps} from 'react-aria-components/slots';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {forwardRef, ReactNode} from 'react';
import {ImageContext} from '@react-spectrum/s2/Image';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';

export interface UserMessageProps extends DOMProps, AriaLabelingProps, SlotProps {
  /** The contents of the user message bubble. */
  children: ReactNode;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

const previewImage = style({
  width: 'full',
  height: 132,
  borderRadius: 'sm',
  backgroundColor: 'transparent',
  objectFit: 'cover'
});

// TODO: revisit whether 75% is the right, or if there should be different modalities
const bubble = style({
  display: 'flex',
  flexDirection: {
    default: 'row',
    ':has([slot=image])': 'column'
  },
  alignItems: {
    default: 'center',
    ':has([slot=image])': 'stretch'
  },
  gap: 8,
  paddingY: 8,
  paddingX: {
    default: 16,
    ':has(img)': 8
  },
  backgroundColor: 'gray-50',
  color: 'neutral',
  borderRadius: 'lg',
  font: 'body',
  boxSizing: 'border-box',
  alignSelf: 'end',
  maxWidth: '75%',
  width: {
    default: 'fit',
    ':has([slot=image])': '75%'
  }
});

/**
 * UserMessage renders a single user-authored message in a conversational AI thread.
 * Pass `slot="image"` on an Image child to switch to a vertical layout with a full-width preview.
 */
export const UserMessage = forwardRef(function UserMessage(
  props: UserMessageProps,
  ref: DOMRef<HTMLDivElement>
) {
  let domRef = useDOMRef(ref);
  let {children, styles} = props;

  return (
    <div
      {...filterDOMProps(props, {labelable: true})}
      ref={domRef}
      className={mergeStyles(bubble, styles)}>
      <Provider
        values={[
          [
            ImageContext,
            {
              slots: {
                [DEFAULT_SLOT]: {},
                image: {styles: previewImage}
              }
            }
          ]
        ]}>
        {children}
      </Provider>
    </div>
  );
});
