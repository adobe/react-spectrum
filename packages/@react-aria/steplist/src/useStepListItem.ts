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

import {HTMLAttributes, RefObject} from 'react';
// @ts-ignore
import {StepListItemProps, StepListState} from '@react-types/steplist';
import {useSelectableItem} from '@react-aria/selection';

interface AriaStepListItemProps extends StepListItemProps {
  /** Whether the step list item represents the current step. */
  isCurrent?: boolean
}

interface StepListItemAria {
  /** Props for the step link element. */
  stepProps: HTMLAttributes<HTMLElement>,
  /** Props for the visually hidden element indicating the step state. */
  stepStateProps?: HTMLAttributes<HTMLElement>,
  /** Text content for the visually hidden message indicating the status of the step state. */
  stepStateText?: String
}

export function useStepListItem<T>(props: AriaStepListItemProps, state: StepListState<T>, ref: RefObject<HTMLElement>): StepListItemAria {
  const {isDisabled: propsDisabled, key} = props;
  let {selectionManager: manager, selectedKey} = state;

  let isDisabled = propsDisabled || state.disabledKeys.has(key);

  let {itemProps} = useSelectableItem({
    isDisabled,
    key,
    ref,
    selectionManager: manager
  });

  const isSelected = selectedKey === key;

  return {
    stepProps: {
      ...itemProps,
      'aria-current': isSelected ? 'step' : undefined,
      tabIndex: 0
    }
  };
}
