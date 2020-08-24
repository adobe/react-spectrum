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

import {AriaBreadcrumbsProps} from '@react-types/breadcrumbs';
import {filterDOMProps} from '@react-aria/utils';
import {HTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useMessageFormatter} from '@react-aria/i18n';

interface BreadcrumbsAria {
  /** Props for the breadcrumbs navigation element. */
  navProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a breadcrumbs component.
 * Breadcrumbs display a heirarchy of links to the current page or resource in an application.
 */
export function useBreadcrumbs<T>(props: AriaBreadcrumbsProps<T>): BreadcrumbsAria {
  let {
    'aria-label': ariaLabel,
    ...otherProps
  } = props;

  let formatMessage = useMessageFormatter(intlMessages);
  return {
    navProps: {
      ...filterDOMProps(otherProps, {labelable: true}),
      'aria-label': ariaLabel || formatMessage('breadcrumbs')
    }
  };
}
