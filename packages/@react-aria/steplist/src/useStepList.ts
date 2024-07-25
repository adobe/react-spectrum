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
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {HTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {StepListProps, StepListState} from '@react-stately/steplist';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSelectableList} from '@react-aria/selection';

export interface AriaStepListProps<T> extends StepListProps<T>, AriaLabelingProps, DOMProps {}

export interface StepListAria {
  listProps: HTMLAttributes<HTMLElement>
}

export function useStepList<T>(props: AriaStepListProps<T>, state: StepListState<T>, ref: RefObject<HTMLOListElement | null>): StepListAria {
  let {
    'aria-label': ariaLabel
  } = props;
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


