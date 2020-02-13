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
import {ActionButton} from '@react-spectrum/button';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames} from '@react-spectrum/utils';
import intlMessages from '../intl';
import {PaginationBase} from '@react-types/pagination';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/pagination/vars.css';
import {TextField} from '@react-spectrum/textfield';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {useMessageFormatter} from '@react-aria/i18n';
import {usePagination} from '@react-aria/pagination';
import {usePaginationState} from '@react-stately/pagination';
import {useProviderProps} from '@react-spectrum/provider';

export function PaginationInput(props: PaginationBase) {
  props = Object.assign({}, {defaultValue: 1}, props);
  props = useProviderProps(props);
  let state = usePaginationState(props);
  let {prevButtonProps, nextButtonProps, textProps} = usePagination(props, state);
  let formatMessage = useMessageFormatter(intlMessages);
  const {maxValue} = props;

  return (
    <nav
      className={classNames(styles, 'spectrum-Pagination', 'spectrum-Pagination--explicit')}>
      <ActionButton
        {...prevButtonProps}
        isQuiet>
        <ChevronLeftMedium />
      </ActionButton>
      <TextField
        {...textProps}
        value={state.value}
        onChange={state.onChange}
        UNSAFE_className={classNames(styles, 'spectrum-Pagination-input')} />
      <span
        className={classNames(typographyStyles, 'spectrum-Body--secondary', classNames(styles, 'spectrum-Pagination-counter'))}>
        {formatMessage('page_count', {n: maxValue})}
      </span>
      <ActionButton
        {...nextButtonProps}
        isQuiet>
        <ChevronRightMedium />
      </ActionButton>
    </nav>
  );
}
