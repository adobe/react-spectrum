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

import {AriaLabelingProps} from '@react-types/shared';
import {ColorChannelFieldProps, ColorChannelFieldState} from '@react-stately/color';
import {NumberFieldAria, useNumberField} from '@react-aria/numberfield';
import {RefObject} from 'react';
import {useLocale} from '@react-aria/i18n';

export interface AriaColorChannelFieldProps extends ColorChannelFieldProps, AriaLabelingProps {}
export interface ColorChannelFieldAria extends NumberFieldAria {}

/**
 * Provides the behavior and accessibility implementation for a color channel field, allowing users to edit the
 * value of an individual color channel.
 */
export function useColorChannelField(props: AriaColorChannelFieldProps, state: ColorChannelFieldState, inputRef: RefObject<HTMLInputElement>): ColorChannelFieldAria {
  let {locale} = useLocale();
  return useNumberField({
    ...props,
    value: undefined,
    defaultValue: undefined,
    onChange: undefined,
    validate: undefined,
    // Provide a default aria-label if no other label is provided.
    'aria-label': props['aria-label'] || (props.label || props['aria-labelledby'] ? undefined : state.colorValue.getChannelName(props.channel, locale))
  }, state, inputRef);
}
