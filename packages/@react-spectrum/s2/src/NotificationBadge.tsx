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

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {ContextValue, SlotProps} from 'react-aria-components';
import {filterDOMProps} from '@react-aria/utils';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
// @ts-ignore
import intlMessages from '../intl/*.json';
import {NumberFormatter} from '@internationalized/number';
import React, {createContext, forwardRef} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface NotificationBadgeStyleProps {
  /**
   * The size of the notification badge.
   *
   * @default 'S'
   */
  size?: 'S' | 'M' | 'L' | 'XL'
}

export interface NotificationBadgeProps extends DOMProps, AriaLabelingProps, StyleProps, NotificationBadgeStyleProps, SlotProps {
  /**
   * The value to be displayed in the notification badge.
   */
  value?: number
}

export const NotificationBadgeContext = createContext<ContextValue<Partial<NotificationBadgeProps>, DOMRefValue<HTMLDivElement>>>(null);

const badge = style({
  display: 'flex',
  font: 'control',
  fontSize: {
    size: {
      S: 'ui-xs',
      M: 'ui-xs',
      L: 'ui-sm',
      XL: 'ui'
    }
  },
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'accent',
  height: {
    size: {
      S: {
        default: 12,
        isEmpty: 8
      },
      M: {
        default: '[14px]',
        isEmpty: 8
      },
      L: {
        default: 16,
        isEmpty: '[10px]'
      },
      XL: {
        default: 18,
        isEmpty: '[10px]'
      }
    }
  },
  aspectRatio: {
    isEmpty: 'square',
    isSingleDigit: 'square'
  },
  width: 'fit',
  paddingX: {
    isDoubleDigit: 'edge-to-text'
  },
  borderRadius: 'pill'
}, getAllowedOverrides());

/**
 * Notification badges are used to indicate new or pending activity .
 */
export const NotificationBadge = forwardRef(function Badge(props: NotificationBadgeProps, ref: DOMRef<HTMLDivElement>) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  [props, ref] = useSpectrumContextProps(props, ref, NotificationBadgeContext);
  let {
    size = 'S',
    value,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {locale} = useLocale();

  if (value && value < 0) {
    throw new Error('Value cannot be negative');
  }

  let truncatedValue: number | undefined = undefined;
  if (value && value > 99) {
    truncatedValue = 99;
  }

  let formattedValue = '';
  if (truncatedValue) {
    formattedValue = new NumberFormatter(locale).format(truncatedValue);
  } else if (value) {
    formattedValue = new NumberFormatter(locale).format(value);
  }

  let length = formattedValue.length;
  let isEmpty = false;
  let isSingleDigit = false;
  let isDoubleDigit = false;
  let isMaxDigit = false;
  if (!value) {
    isEmpty = true; 
  } else if (length === 1) {
    isSingleDigit = true;
  } else if (length === 2) {
    isDoubleDigit = true;
  }

  if (truncatedValue) {
    formattedValue += stringFormatter.format('notificationbadge.plus');
  }

  return (
    <span
      {...filterDOMProps(otherProps)}
      role="presentation"
      className={(props.UNSAFE_className || '') + badge({size, isEmpty, isSingleDigit, isDoubleDigit, isMaxDigit}, props.styles)}
      style={props.UNSAFE_style}
      ref={domRef}>
      {formattedValue}
    </span>
  );
});
