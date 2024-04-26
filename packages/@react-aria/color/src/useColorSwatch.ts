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

import {AriaLabelingProps, DOMProps} from '@react-types/shared';
import {Color} from '@react-types/color';
import {filterDOMProps, useId} from '@react-aria/utils';
import {HTMLAttributes, useMemo} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {parseColor} from '@react-stately/color';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaColorSwatchProps extends AriaLabelingProps, DOMProps {
  /** The color value to display in the swatch. */
  color?: string | Color | null,
  /** 
   * A localized accessible name for the color.
   * By default, a description is generated from the color value,
   * but this can be overridden if you have a more specific color
   * name (e.g. Pantone colors).
   */
  colorName?: string
}

export interface ColorSwatchAria {
  /** Props for the color swatch element. */
  colorSwatchProps: HTMLAttributes<HTMLElement>,
  /** The parsed color value of the swatch. */
  color: Color
}

/**
 * Provides the accessibility implementation for a color swatch component.
 * A color swatch displays a preview of a selected color.
 */
export function useColorSwatch(props: AriaColorSwatchProps): ColorSwatchAria {
  let {color: value, colorName} = props;
  let nonNullValue = value || '#fff0';
  let color = useMemo(() => typeof nonNullValue === 'string' ? parseColor(nonNullValue) : nonNullValue, [nonNullValue]);
  let {locale} = useLocale();
  let DOMProps = filterDOMProps(props, {labelable: true});
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/color');
  let id = useId(props.id);

  if (!colorName) {
    colorName = color.getChannelValue('alpha') === 0 ? stringFormatter.format('transparent') : color.getColorName(locale);
  }

  return {
    colorSwatchProps: {
      ...DOMProps,
      role: 'img',
      'aria-roledescription': stringFormatter.format('colorSwatch'),
      'aria-label': [colorName, props['aria-label'] || ''].filter(Boolean).join(', '),
      'aria-labelledby': props['aria-labelledby'] ? `${id} ${props['aria-labelledby']}` : undefined,
      id,
      style: {
        backgroundColor: color.toString('css'),
        // @ts-ignore
        forcedColorAdjust: 'none'
      }
    },
    color: color || null
  };
}
