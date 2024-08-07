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

import {HTMLAttributes} from 'react';
import {Key, RefObject} from '@react-types/shared';
import {StepListState} from '@react-stately/steplist';
import {useSelectableItem} from '@react-aria/selection';

export interface AriaStepListItemProps {
  key: Key
}

export interface StepListItemAria {
  /** Props for the step link element. */
  stepProps: HTMLAttributes<HTMLElement>,
  /** Props for the visually hidden element indicating the step state. */
  stepStateProps?: HTMLAttributes<HTMLElement>,
  /** Text content for the visually hidden message indicating the status of the step state. */
  stepStateText?: String
}

export function useStepListItem<T>(props: AriaStepListItemProps, state: StepListState<T>, ref: RefObject<HTMLElement | null>): StepListItemAria {
  const {key} = props;
  let {selectionManager: manager, selectedKey} = state;

  let isDisabled = !state.isSelectable(key);

  let {itemProps} = useSelectableItem({
    isDisabled,
    key,
    ref,
    selectionManager: manager
  });

  const isSelected = selectedKey === key;

  let onKeyDown = (event) => {
    const {key: eventKey} = event;

    if (eventKey === 'ArrowDown' || eventKey === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
    }

    itemProps.onKeyDown?.(event);
  };

  return {
    stepProps: {
      ...itemProps,
      onKeyDown,
      role: 'link',
      'aria-current': isSelected ? 'step' : undefined,
      'aria-disabled': isDisabled ? true : undefined,
      tabIndex: !isDisabled ? 0 : undefined
    }
  };
}
