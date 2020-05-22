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

import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, useRef} from 'react';
import {useId} from '@react-aria/utils';
import {useLink} from '@react-aria/link';

interface AriaBreadcrumbItemProps extends BreadcrumbItemProps, DOMProps {
  /**
   * The HTML element used to render the breadcrumb link, e.g. "a", or "span".
   * @default "a"
   */
  elementType?: string,
}

interface BreadcrumbItemAria {
  /** Props for the breadcrumb item link element. */
  breadcrumbItemProps: HTMLAttributes<HTMLDivElement>
}

/**
 * Provides the behavior and accessibility implementation for an in a breadcrumbs component.
 * See `useBreadcrumbs` for details about breadcrumbs.
 */
export function useBreadcrumbItem(props: AriaBreadcrumbItemProps): BreadcrumbItemAria {
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
  let {linkProps} = useLink({children, isDisabled: isDisabled || isCurrent, ...otherProps, ref});

  let itemProps: HTMLAttributes<HTMLDivElement> = isCurrent
    ? {...linkProps, 'aria-current': ariaCurrent || 'page'}
    : linkProps;

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
