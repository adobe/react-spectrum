/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaToggleButtonProps} from '@react-types/button';
import {ButtonAria, useButton} from './useButton';
import {chain} from '@react-aria/utils';
import {mergeProps} from '@react-aria/utils';
import {RefObject} from 'react';
import {ToggleState} from '@react-stately/toggle';

export function useToggleButton(props: AriaToggleButtonProps, state: ToggleState, ref: RefObject<HTMLElement>): ButtonAria {
  const {isSelected} = state;
  const {isPressed, buttonProps} = useButton({
    ...props,
    onPress: chain(state.toggle, props.onPress)
  }, ref);

  return {
    isPressed,
    buttonProps: mergeProps(buttonProps, {
      'aria-pressed': isSelected
    })
  };
}
