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

import {AllHTMLAttributes, useRef} from 'react';
import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import {DOMProps} from '@react-types/shared';
import {useId} from '@react-aria/utils';
import {useLink} from '@react-aria/link';

interface BreadcrumbItemAria {
  breadcrumbItemProps: AllHTMLAttributes<HTMLDivElement>
}

export function useBreadcrumbItem(props: BreadcrumbItemProps & DOMProps): BreadcrumbItemAria {
  let {
    id,
    isCurrent,
    isDisabled,
    isHeading,
    headingAriaLevel = 1,
    children = '',
    'aria-current': ariaCurrent,
    ...otherProps
  } = props;

  let ref = useRef();
  let {linkProps} = useLink({children, isDisabled, ...otherProps, ref});

  let itemProps: AllHTMLAttributes<HTMLDivElement> = isCurrent
    ? {'aria-current': ariaCurrent || 'page', role: linkProps.role}
    : {...linkProps};

  let breadcrumbItemHeadingProps;
  if (isHeading && isCurrent) {
    breadcrumbItemHeadingProps = {
      role: 'heading',
      'aria-level': headingAriaLevel
    };
  }

  return {
    breadcrumbItemProps: {
      id: useId(id),
      'aria-disabled': isDisabled,
      ...itemProps,
      ...breadcrumbItemHeadingProps
    }
  };
}
