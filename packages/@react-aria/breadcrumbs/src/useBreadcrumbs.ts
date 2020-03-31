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

import {AllHTMLAttributes} from 'react';
import {BreadcrumbsProps} from '@react-types/breadcrumbs';
import {DOMProps} from '@react-types/shared';
import intlMessages from '../intl/*.json';
import {useId} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface BreadcrumbsAria {
  breadcrumbsProps: AllHTMLAttributes<HTMLDivElement>
}

export function useBreadcrumbs<T>(props: BreadcrumbsProps<T> & DOMProps): BreadcrumbsAria {
  let {
    id,
    'aria-label': ariaLabel
  } = props;

  let formatMessage = useMessageFormatter(intlMessages);
  return {
    breadcrumbsProps: {
      id: useId(id),
      'aria-label': ariaLabel || formatMessage('breadcrumbs')
    }
  };
}
