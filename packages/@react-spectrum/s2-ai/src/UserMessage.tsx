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

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {ContextValue, DEFAULT_SLOT, Provider, SlotProps} from 'react-aria-components/slots';
import {createContext, forwardRef, ReactNode} from 'react';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {getAllowedOverrides} from './style-utils-copy' with {type: 'macro'};
import {ImageContext} from '@react-spectrum/s2/Image';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import type {StyleProps} from './style-utils-copy';
import {useDOMRef} from './useDOMRef';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface UserMessageProps extends DOMProps, AriaLabelingProps, StyleProps, SlotProps {
  /** The contents of the user message bubble. */
  children: ReactNode;
}

export const UserMessageContext =
  createContext<ContextValue<Partial<UserMessageProps>, DOMRefValue<HTMLDivElement>>>(null);

const previewImage = style({
  width: 'full',
  height: 132,
  borderRadius: 'sm',
  backgroundColor: 'transparent',
  objectFit: 'cover'
});

// TODO: revisit whether 75% is the right, or if there should be different modalities
const bubble = style(
  {
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
  },
  getAllowedOverrides()
);

/**
 * UserMessage renders a single user-authored message in a conversational AI thread.
 * Pass `slot="image"` on an Image child to switch to a vertical layout with a full-width preview.
 */
export const UserMessage = forwardRef(function UserMessage(
  props: UserMessageProps,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, UserMessageContext);
  let domRef = useDOMRef(ref);
  let {children, UNSAFE_className = '', UNSAFE_style, styles} = props;

  return (
    <div
      {...filterDOMProps(props, {labelable: true})}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + bubble(null, styles)}>
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
