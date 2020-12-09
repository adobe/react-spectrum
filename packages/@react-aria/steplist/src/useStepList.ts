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

import {HTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {StepListAria} from '@react-types/steplist';
import {useMessageFormatter} from '@react-aria/i18n';

// We don't appear to need any props to this?  It is just providing the default aria-label 
// As all the aria heavy lifting is do in `useStepListItem`
export function useStepList(/* <T>( props: StepListProps<T>, state: StepListState<T> */): StepListAria {
  const formatMessage = useMessageFormatter(intlMessages);
  const listProps: HTMLAttributes<HTMLElement> = {
    'aria-label': formatMessage('steplist')
  };
  return {
    listProps
  };
}


