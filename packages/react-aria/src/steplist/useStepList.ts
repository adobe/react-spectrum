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

import {AriaLabelingProps, DOMProps, RefObject} from '@react-types/shared';
import {filterDOMProps} from '../utils/filterDOMProps';
import {HTMLAttributes} from 'react';
import intlMessages from '../../intl/steplist/*.json';
// @ts-ignore
import {mergeProps} from '../utils/mergeProps';
import {StepListProps, StepListState} from 'react-stately/private/steplist/useStepListState';
import {useLocalizedStringFormatter} from '../i18n/useLocalizedStringFormatter';
import {useSelectableList} from '../selection/useSelectableList';

export interface AriaStepListProps<T> extends StepListProps<T>, AriaLabelingProps, DOMProps {}

export interface StepListAria {
  listProps: HTMLAttributes<HTMLElement>;
}

export function useStepList<T>(
  props: AriaStepListProps<T>,
  state: StepListState<T>,
  ref: RefObject<HTMLOListElement | null>
): StepListAria {
  let {'aria-label': ariaLabel} = props;
  let {listProps} = useSelectableList({
    ...props,
    ...state,
    allowsTabNavigation: true,
    ref
  });

  const strings = useLocalizedStringFormatter(intlMessages, '@react-aria/steplist');
  const stepListProps: HTMLAttributes<HTMLElement> = {
    ...mergeProps(listProps, filterDOMProps(props, {labelable: true})),
    'aria-label': ariaLabel || strings.format('steplist')
  };

  return {
    listProps: {
      ...stepListProps,
      tabIndex: undefined
    }
  };
}
