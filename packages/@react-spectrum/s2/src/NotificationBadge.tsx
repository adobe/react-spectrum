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
import {NumberFormatter} from '@internationalized/number';
import React, {createContext, forwardRef} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface NotificationBadgeStyleProps {
  /**
   * The size of the badge.
   *
   * @default 'S'
   */
  size?: 'S' | 'M' | 'L' | 'XL'
}

export interface NotificationBadgeProps extends DOMProps, AriaLabelingProps, StyleProps, NotificationBadgeStyleProps, SlotProps {
  /**
   * The value to be displayed in the badge.
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
    isSingleDigit: 'square'
  },
  // width: {
  //   isSingleDigit: {
  //     size: {
  //       S: 12,
  //       M: '[14px]',
  //       L: 16,
  //       XL: 18
  //     }
  //   },
  //   isDoubleDigit: {
  //     size: {
  //       S: 18,
  //       M: 20,
  //       L: '[22px]',
  //       XL: 26
  //     }
  //   },
  //   isMaxDigit: {
  //     size: {
  //       S: 24,
  //       M: '[26px]',
  //       L: 28,
  //       XL: '[34px]'
  //     }
  //   },
  //   isEmpty: {
  //     size: {
  //       S: 8,
  //       M: 8,
  //       L: '[10px]',
  //       XL: '[10px]'
  //     }
  //   }
  // },
  borderRadius: 'pill'
}, getAllowedOverrides());

let wrapper = style({
  width: 'fit',
  '--textWidth': {
    type: 'width',
    value: '[self(width)]'
  }
})

/**
 * Badges are used for showing a small amount of color-categorized metadata, ideal for getting a user's attention.
 */
export const NotificationBadge = forwardRef(function Badge(props: NotificationBadgeProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, NotificationBadgeContext);
  let {
    size = 'S',
    value,
    ...otherProps
  } = props; // useProviderProps(props) in v3
  let domRef = useDOMRef(ref);
  let {locale} = useLocale();

  // should we error if the value is negative? is that a valid value someone can enter? ask design?
  if (value && value > 99) {
    value = 99;
  }

  let isEmpty = false;
  let isSingleDigit = false;
  let isDoubleDigit = false;
  let isMaxDigit = false;
  if (!value) {
    isEmpty = true; 
  } else if (value < 10) {
    isSingleDigit = true;
  } else if (value === 99) {
    isMaxDigit = true;
  } else {
    isDoubleDigit = true;
  }


  let formattedValue = '';
  if (value) {
    formattedValue = new NumberFormatter(locale).format(value);
    formattedValue = new NumberFormatter('zh-CN', {numberingSystem: 'hanidec'}).format(value);
    // formattedValue = new NumberFormatter('ko-KR', {numberingSystem: 'kore'}).format(value);
  }

  console.log(formattedValue.length);
  
  if (value === 99) {
    // do we need to localize this? are there any locales where we should using something else than a + symbol?
    formattedValue += '+';
  }

  return (
    <span
      {...filterDOMProps(otherProps)}
      role="presentation"
      className={(props.UNSAFE_className || '') + badge({size, isEmpty, isSingleDigit, isDoubleDigit, isMaxDigit}, props.styles)}
      style={props.UNSAFE_style}
      ref={domRef}>
        <span>
          {formattedValue}
        </span>
    </span>
  );
});
