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

import {AriaBreadcrumbItemProps} from '@react-types/breadcrumbs';
import {DOMAttributes, FocusableElement} from '@react-types/shared';
import {focusSafely} from '@react-aria/focus';
import {RefObject, useEffect} from 'react';
import {useLink} from '@react-aria/link';

interface BreadcrumbItemAria {
  /** Props for the breadcrumb item link element. */
  itemProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for an in a breadcrumbs component.
 * See `useBreadcrumbs` for details about breadcrumbs.
 */
export function useBreadcrumbItem(props: AriaBreadcrumbItemProps, ref: RefObject<FocusableElement>): BreadcrumbItemAria {
  let {
    isCurrent,
    isDisabled,
    isFocusWithinBreadcrumbs,
    'aria-current': ariaCurrent,
    elementType = 'a',
    ...otherProps
  } = props;

  let {linkProps} = useLink({isDisabled: isDisabled || isCurrent, elementType, ...otherProps}, ref);
  let isHeading = /^h[1-6]$/.test(elementType);
  let itemProps: DOMAttributes = {};

  if (!isHeading) {
    itemProps = linkProps;
  }

  if (isCurrent) {
    itemProps['aria-current'] = ariaCurrent || 'page';
    itemProps.tabIndex = -1;
  }

  useEffect(() => {
    if (ref && ref.current && isCurrent && isFocusWithinBreadcrumbs) {
      focusSafely(ref.current);
    }
  }, [ref, isCurrent, isFocusWithinBreadcrumbs]);

  return {
    itemProps: {
      'aria-disabled': isDisabled,
      ...itemProps
    }
  };
}
