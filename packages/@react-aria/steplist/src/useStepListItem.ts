/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {RefObject} from 'react';
// @ts-ignore
import {StepListItemAria, StepListItemProps, StepListState} from '@react-types/steplist';
import {useSelectableItem} from '@react-aria/selection';

export function useStepListItem<T>(props: StepListItemProps<T>, state: StepListState<T>, ref: RefObject<HTMLElement>): StepListItemAria {
  const {isReadOnly, item} = props;
  const {key} = item;

  let {selectionManager: manager, selectedKey} = state;

  let isDisabled = isReadOnly || state.disabledKeys.has(key);

  let {itemProps} = useSelectableItem({
    selectionManager: manager,
    key,
    ref,
    isDisabled
  });

  const isSelected = selectedKey === key;
  const isFocused = key === manager.focusedKey;

  let {tabIndex} = itemProps;

  return {
    stepProps: {
      ...itemProps,
      'aria-selected': isSelected,
      'aria-current': isSelected ? 'step' : undefined,
      'aria-disabled': isDisabled || undefined,
      'aria-live': isFocused ? 'assertive' : undefined,
      'aria-atomic': isFocused || undefined,
      'aria-relevant': isFocused ? 'text' : undefined,
      tabIndex: isDisabled ? undefined : tabIndex
    }
  };
}
