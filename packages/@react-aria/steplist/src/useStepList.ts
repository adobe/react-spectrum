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


import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {HTMLAttributes, RefObject, useMemo} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {SpectrumStepListProps, StepListAria, StepListState} from '@react-types/steplist';
import {StepListKeyboardDelegate} from './StepListKeyboardDelegate';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useSelectableCollection} from '@react-aria/selection';

export function useStepList<T>(props: SpectrumStepListProps<T>, state: StepListState<T>, ref: RefObject<HTMLOListElement>): StepListAria {
  let {
    isDisabled,
    'aria-label': ariaLabel,
    orientation = 'horizontal',
    keyboardActivation = 'automatic'
  } = props;
  let allKeys = [...state.collection.getKeys()];

  if (!allKeys.some(key => !state.disabledKeys.has(key))) {
    isDisabled = true;
  }

  let {
    collection,
    selectionManager: manager,
    disabledKeys
  } = state;
  let {direction} = useLocale();
  let delegate = useMemo(() => new StepListKeyboardDelegate(
    collection,
    direction,
    orientation,
    disabledKeys), [collection, disabledKeys, orientation, direction]);

  let {collectionProps} = useSelectableCollection({
    ref,
    selectionManager: manager,
    keyboardDelegate: delegate,
    selectOnFocus: keyboardActivation === 'automatic',
    disallowEmptySelection: true,
    scrollRef: ref
  });

  const formatMessage = useMessageFormatter(intlMessages);
  const listProps: HTMLAttributes<HTMLElement> = {
    ...mergeProps(collectionProps, filterDOMProps(props)),
    'aria-orientation': orientation,
    'aria-label': ariaLabel || formatMessage('steplist'),
    'aria-disabled': isDisabled
  };

  return {
    listProps
  };
}


