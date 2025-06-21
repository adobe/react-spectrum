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
import {fontRelative, style} from '../style' with {type: 'macro'};
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
// @ts-ignore
import intlMessages from '../intl/*.json';
import {NumberFormatter} from '@internationalized/number';
import React, {createContext, forwardRef} from 'react';
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
  value?: number | null
}

interface NotificationBadgeContextProps extends Partial<NotificationBadgeProps> {
  isDisabled?: boolean,
  staticColor?: 'black' | 'white' | 'auto'
}

export const NotificationBadgeContext = createContext<ContextValue<Partial<NotificationBadgeContextProps>, DOMRefValue<HTMLDivElement>>>(null);

const badge = style({
  display: {
    default: 'flex',
    isDisabled: 'none'
  },
  font: 'ui',
  color: {
    default: 'white',
    isStaticColor: 'auto',
    forcedColors: 'ButtonText'
  },
  fontSize: {
    size: {
      S: 'ui-xs',
      M: 'ui-xs',
      L: 'ui-sm',
      XL: 'ui'
    }
  },
  borderStyle: {
    forcedColors: 'solid'
  },
  borderWidth: {
    forcedColors: '[1px]'
  },
  borderColor: {
    forcedColors: 'ButtonBorder'
  },
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: {
    default: 'accent',
    isStaticColor: 'transparent-overlay-1000',
    forcedColors: 'ButtonFace'
  },
  height: {
    size: {
      S: {
        default: 12,
        isIndicatorOnly: 8
      },
      M: {
        default: fontRelative(18), // sort of arbitrary? tried to get as close to the figma designs as possible
        isIndicatorOnly: 8
      },
      L: {
        default: 16,
        isIndicatorOnly: fontRelative(12)
      },
      XL: {
        default: 18,
        isIndicatorOnly: fontRelative(12)
      }
    }
  },
  aspectRatio: {
    isIndicatorOnly: 'square',
    isSingleDigit: 'square'
  },
  width: 'max',
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
    isDisabled = false,
    staticColor,
    ...otherProps
  } = props as NotificationBadgeContextProps;
  let domRef = useDOMRef(ref);
  let {locale} = useLocale();
  let formattedValue = '';

  let isIndicatorOnly = false;
  let isSingleDigit = false;
  let isDoubleDigit = false;

  if (value == null) {
    isIndicatorOnly = true;
  } else if (value <= 0) {
    throw new Error('Value cannot be negative or zero');
  } else if (!Number.isInteger(value)) {
    throw new Error('Value must be a positive integer');
  } else {
    formattedValue = new NumberFormatter(locale).format(Math.min(value, 99));
    let length = Math.log(value <= 99 ? value : 99) * Math.LOG10E + 1 | 0;  // for positive integers (https://stackoverflow.com/questions/14879691/get-number-of-digits-with-javascript)
    if (length === 1) {
      isSingleDigit = true;
    } else if (length === 2) {
      isDoubleDigit = true;
    }

    if (value > 99) {
      formattedValue = stringFormatter.format('notificationbadge.plus', {notifications: formattedValue});
    }
  }

  let ariaLabel = props['aria-label'] || undefined;
  if (ariaLabel === undefined && isIndicatorOnly) {
    ariaLabel = stringFormatter.format('notificationbadge.indicatorOnly');
  }

  return (
    <span
      {...filterDOMProps(otherProps, {labelable: true})}
      role={ariaLabel && 'img'}
      aria-label={ariaLabel}
      className={(props.UNSAFE_className || '') + badge({size, isIndicatorOnly, isSingleDigit, isDoubleDigit, isDisabled, isStaticColor: !!staticColor}, props.styles)}
      style={props.UNSAFE_style}
      ref={domRef}>
      {formattedValue}
    </span>
  );
});
